from flask import Flask, request
from flask_cors import CORS

from okx.api import Market as Market_api
from okx.app import OkxSPOT

import pandas as pd
import time
from prophet import Prophet
import statsmodels.api as sm
from datetime import datetime
from sklearn.metrics import mean_absolute_error, mean_squared_error

import warnings
warnings.filterwarnings("ignore")

columns = ['timestamp', 'open', 'high', 'low', 'close', 'volume', 'volCcy', 'volCcyQuote', 'confirm']
date_string_after = ['2023-1-31','2023-2-28','2023-3-31','2023-4-30','2023-5-31','2023-6-30',
                     '2023-7-31','2023-8-31','2023-9-30','2023-10-31','2023-11-30','2023-12-31']

market = Market_api(key = '', secret = '', passphrase = '', flag = '0')
okxSPOT = OkxSPOT(
    key = "",
    secret = "",
    passphrase = "",
)

def History_finder(y, m, inter, full_data, instId):

    # Declare full_data as a global variable
    month = f"{y}-{m}-1"
    time_before = datetime.strptime(month, "%Y-%m-%d").timestamp()
    
    if y == 2023:
        time_after = datetime.strptime(date_string_after[m - 1], "%Y-%m-%d").timestamp()
    else:
        time_after = datetime.strptime('2024-1-31', "%Y-%m-%d").timestamp()
        
    result = market.get_history_candles(
        instId = instId,
        before = str(round(time_before * 1000)),
        after = str(round(time_after * 1000)),
        bar = inter
    )
    
    data = pd.DataFrame(result['data'], columns = columns)
    data['date'] = pd.to_datetime(data['timestamp'], unit = 'ms')
    print(data)
    data.sort_values(by = 'date', inplace = True)
    data[['open', 'high', 'low', 'close']] = data[['open', 'high', 'low', 'close']].apply(pd.to_numeric)
    data.drop(['volume', 'timestamp', 'confirm', 'volCcyQuote', 'volCcy'], axis = 1, inplace = True)

    full_data = pd.concat([full_data, data])
    full_data['date'] = pd.to_datetime(full_data['date'])
    full_data['date'] = full_data['date'].dt.strftime('%Y-%m-%d')

    return full_data

def arima_AIC(data, p = 4, d = 4, q = 4):

    # MSE
    period = 1
    L = len(data)
    train = data[ : (L - period)]
    test = data[ - period: ]
    mse_r = []
    # AIC
    best_pdq =["AIC_pdq", 10000, "MSE", 10000]
    AIC = []
    
    for i in range(p): # AR
        
        for j in range(1, d): # I
            
            for k in range(q): # MA
                
                model = sm.tsa.arima.ARIMA(data, order = (i,j,k))
                fitted = model.fit()
                # MSE
                forecast = fitted.forecast(step = period, alpha = 0.05)
                mse = mean_squared_error(test, forecast)
                mse_r.append(mse)
                # AIC
                AIC.append(fitted.aic)
                
                if fitted.aic < best_pdq[1]:
                    
                    best_pdq[0] = (i, j, k)
                    best_pdq[1] = fitted.aic
                    
                if mse < best_pdq[1]:
                    
                    best_pdq[2] = (i, j, k)
                    best_pdq[3] = mse
    
    return best_pdq[0], best_pdq[2]

def arima_predict(full_data, best_pdq_MSE):

    model = sm.tsa.ARIMA(full_data['open'], order = best_pdq_MSE)
    fitted = model.fit()
    number_of_steps = 10
    forecast = fitted.forecast(steps = number_of_steps)

    ten_days_after = forecast.values[9]
    one_days_after = forecast.values[0]

    percentage_change = ((ten_days_after - one_days_after) / one_days_after) * 100

    return forecast, percentage_change

def prophet_predict(full_data):
    
    new_full_data = full_data.set_index('date', inplace = False)
    df = pd.DataFrame(new_full_data['open'])
    df.reset_index(inplace = True)
    df = df.rename(columns = {'date': 'ds', 'open': 'y'})
    model = Prophet()
    model.fit(df)
    future = model.make_future_dataframe(periods=10)
    forecast = model.predict(future)
    predicted = forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].tail(10).reset_index()
    ten_days_after = predicted['yhat'].iloc[9]
    one_days_after = predicted['yhat'].iloc[0]
    percentage_change = ((ten_days_after - one_days_after) / one_days_after) * 100
    
    return forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']], percentage_change

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    instId = request.args.get('instId', 'BTC-USDT') 
    full_data_one = pd.DataFrame(columns = ['open', 'high', 'low', 'close'])
    full_data_three = pd.DataFrame(columns = ['open', 'high', 'low', 'close'])
    # 1 day
    for m in range(11, 13):
        full_data_one = History_finder(2023, m, '1D', full_data_one, instId)

    full_data_one = History_finder(2024, 1, '1D', full_data_one, instId)

    best_pdq_AIC_one, best_pdq_MSE_one = arima_AIC(full_data_one['open'], 4, 4, 4)
    arima_forecast_one, percentage_change_one = arima_predict(full_data_one, best_pdq_MSE_one)
    # 3 day
    for m in range(8, 13):
        full_data_three = History_finder(2023, m, '3D', full_data_three, instId)

    full_data_three = History_finder(2024, 1, '3D', full_data_three, instId)

    best_pdq_AIC_three, best_pdq_MSE_three = arima_AIC(full_data_three['open'], 4, 4, 4)
    arima_forecast_three, percentage_change_three = arima_predict(full_data_three, best_pdq_MSE_three)
    prophet_forecast_one, p_change_one = prophet_predict(full_data_one)
    prophet_forecast_three, p_change_three = prophet_predict(full_data_three)

    # 整合成 JSON 物件
    result = {
        "full_data_one": full_data_one.to_json(orient = 'records'),
        "full_data_three": full_data_three.to_json(orient = 'records'),
        "error": {
            "best_pdq_AIC_one": best_pdq_AIC_one,
            "best_pdq_MSE_one": best_pdq_MSE_one,
            "best_pdq_AIC_three": best_pdq_AIC_three,
            "best_pdq_MSE_three": best_pdq_MSE_three
        },
        "arima_predict": {
            "forecast_one": arima_forecast_one.to_json(orient = 'records'),
            "forecast_three": arima_forecast_three.to_json(orient = 'records'),
            "percentage_change_one": percentage_change_one,
            "percentage_change_three": percentage_change_three,
        },
        "prophet_predict": {
            "forecast_one": prophet_forecast_one.to_json(orient = 'records'),
            "forecast_three": prophet_forecast_three.to_json(orient = 'records'),
            "percentage_change_one": p_change_one,
            "percentage_change_three": p_change_three,
        }
    }

    return result

if __name__ == '__main__':
    app.run(debug = True)
