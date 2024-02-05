from flask import Flask
from flask_cors import CORS

from okx.api import Market as Market_api
from okx.app import OkxSPOT
import pandas as pd
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

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
    global full_data  # Declare full_data as a global variable
    month = f"{y}-{m}-1"
    time_before = datetime.strptime(month, "%Y-%m-%d").timestamp()
    
    if y == 2023:
        time_after = datetime.strptime(date_string_after[m - 1], "%Y-%m-%d").timestamp()
    else:
        time_after = datetime.strptime('2024-1-31', "%Y-%m-%d").timestamp()
        
    result = market.get_history_candles(
        instId='BTC-USDT',
        before=str(round(time_before * 1000)),
        after=str(round(time_after * 1000)),
        bar='1D'
    )
    
    data = pd.DataFrame(result['data'], columns=columns)
    data['date'] = pd.to_datetime(data['timestamp'], unit='ms')
    data.sort_values(by='date', inplace=True)
    data.set_index('date', inplace=True)
    data[['open', 'high', 'low', 'close']] = data[['open', 'high', 'low', 'close']].apply(pd.to_numeric)
    data.drop(['volume', 'timestamp', 'confirm', 'volCcyQuote', 'volCcy'], axis=1, inplace=True)
    full_data = pd.concat([full_data, data])
    
    return full_data

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    # for m in range(8, 13):
    #     full_data = History_finder(2023, m)

    full_data = History_finder(2024, 1)

    return full_data.to_json(orient='records')

if __name__ == '__main__':
    app.run(debug=True)
