from sklearn.metrics import mean_squared_error
from prophet import Prophet
from flask import Flask, request
from flask_cors import CORS
import datetime
import statsmodels.api as sm
import yfinance as yf

import warnings
warnings.filterwarnings("ignore")

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

    model = sm.tsa.ARIMA(full_data['Open'], order = best_pdq_MSE)
    fitted = model.fit()
    number_of_steps = 10
    forecast = fitted.forecast(steps = number_of_steps)

    ten_days_after = forecast.values[9]
    one_days_after = forecast.values[0]

    percentage_change = ((ten_days_after - one_days_after) / one_days_after) * 100

    return forecast, percentage_change

def prophet_predict(full_data):

    df = full_data.loc[:, ['Date', 'Open']]
    # df.reset_index(inplace = True)
    df = df.rename(columns = {'Date': 'ds', 'Open': 'y'})
    model = Prophet()
    model.fit(df)
    future = model.make_future_dataframe(periods = 10)
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
    desired_columns = ["Open", "High", "Low", "Close"]
    instId = request.args.get('instId', 'BTC-USD') 
    # 1 day
    full_data_one = yf.download(instId, start = "2023-01-01", end = datetime.date.today().strftime("%Y-%m-%d"), interval = "1d")
    full_data_one = full_data_one.loc[:, desired_columns].reset_index()

    best_pdq_AIC_one, best_pdq_MSE_one = arima_AIC(full_data_one['Open'], 4, 4, 4)
    arima_forecast_one, percentage_change_one = arima_predict(full_data_one, best_pdq_MSE_one)
    # 3 day
    full_data_three = yf.download(instId, start = "2023-01-01", end = datetime.date.today().strftime("%Y-%m-%d"), interval = "5d")
    full_data_three = full_data_three.loc[:, desired_columns].reset_index()

    best_pdq_AIC_three, best_pdq_MSE_three = arima_AIC(full_data_three['Open'], 4, 4, 4)
    arima_forecast_three, percentage_change_three = arima_predict(full_data_three, best_pdq_MSE_three)
    
    prophet_forecast_one, p_change_one = prophet_predict(full_data_one)
    prophet_forecast_three, p_change_three = prophet_predict(full_data_three)

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
