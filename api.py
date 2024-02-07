from flask import Flask
from flask_cors import CORS

from okx.api import Market as Market_api
from okx.app import OkxSPOT

import pandas as pd
import time
import statsmodels.api as sm
from datetime import datetime
from sklearn.metrics import mean_absolute_error, mean_squared_error

columns = ['timestamp', 'open', 'high', 'low', 'close', 'volume', 'volCcy', 'volCcyQuote', 'confirm']
date_string_after = ['2023-1-31','2023-2-28','2023-3-31','2023-4-30','2023-5-31','2023-6-30',
                     '2023-7-31','2023-8-31','2023-9-30','2023-10-31','2023-11-30','2023-12-31']

market = Market_api(key='', secret='', passphrase='', flag='0')
okxSPOT = OkxSPOT(
    key="",
    secret="",
    passphrase="",
)

full_data = pd.DataFrame(columns=['open', 'high', 'low', 'close'])

def History_finder(y, m):

    full_data = pd.DataFrame(columns=['open', 'high', 'low', 'close'])

    # global full_data  # Declare full_data as a global variable
    month = f"{y}-{m}-1"
    time_before = datetime.strptime(month, "%Y-%m-%d").timestamp()
    
    if y == 2023:
        time_after = datetime.strptime(date_string_after[m - 1], "%Y-%m-%d").timestamp()
    else:
        time_after = datetime.strptime('2024-1-31', "%Y-%m-%d").timestamp()
        
    result = market.get_history_candles(
        instId = 'BTC-USDT',
        before = str(round(time_before * 1000)),
        after = str(round(time_after * 1000)),
        bar = '1D'
    )
    
    data = pd.DataFrame(result['data'], columns = columns)
    data['date'] = pd.to_datetime(data['timestamp'], unit = 'ms')
    data.sort_values(by='date', inplace=True)
    data[['open', 'high', 'low', 'close']] = data[['open', 'high', 'low', 'close']].apply(pd.to_numeric)
    data.drop(['volume', 'timestamp', 'confirm', 'volCcyQuote', 'volCcy'], axis=1, inplace=True)
    full_data = pd.concat([full_data, data])
    full_data['date'] = pd.to_datetime(full_data['date'])
    full_data['date'] = full_data['date'].dt.strftime('%Y-%m-%d')

    return full_data

def arima_AIC(data, p = 4, d = 4, q = 4):
    
    start_time = time.time()
    
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
                    
    end_time = time.time()
    print(f"used time : {end_time - start_time}")
    
    return best_pdq[0], best_pdq[2]

def predict(full_data, best_pdq_MSE):

    model = sm.tsa.ARIMA(full_data['open'], order = best_pdq_MSE)
    fitted = model.fit()
    number_of_steps = 10
    forecast = fitted.forecast(steps = number_of_steps)

    ten_days_after = forecast.values[9]
    one_days_after = forecast.values[0]

    percentage_change = ((ten_days_after - one_days_after) / one_days_after) * 100

    return forecast, percentage_change

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():

    for m in range(8, 13):
        full_data = History_finder(2023, m)

    full_data = History_finder(2024, 1)

    best_pdq_AIC, best_pdq_MSE = arima_AIC(full_data['open'], 4, 4, 4)
    print(best_pdq_MSE)

    forecast, percentage_change = predict(full_data, best_pdq_MSE)

    # 整合成 JSON 物件
    result = {
        "full_data": full_data.to_json(orient = 'records'),
        "error": {
            "best_pdq_AIC": best_pdq_AIC,
            "best_pdq_MSE": best_pdq_MSE
        },
        "predict": {
            "forecast": forecast.to_json(orient = 'records'),
            "percentage_change": percentage_change
        }
    }

    return result

if __name__ == '__main__':
    app.run(debug = True)
