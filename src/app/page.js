"use client";

import Image from "next/image";
import { useEffect, useState } from 'react';
import axios from 'axios';
import Chart from 'chart.js/auto';

export default function Home() {

  const [apiData1, setApiData1] = useState(null);
  const [apiData2, setApiData2] = useState(null);
  const [predictData1, setPredictData1] = useState(null);
  const [predictData2, setPredictData2] = useState(null);
  const [prophetData1, setProphetData1] = useState(null);
  const [prophetData2, setProphetData2] = useState(null);
  const [errorData, setErrorData] = useState(null);
  const [arimaSelected, setArimaSelected] = useState(true);
  const [prophetSelected, setProphetSelected] = useState(false);
  const [day1selected, selectday1] = useState(true);
  const [day3selected, selectday3] = useState(false);
  const [selectedCrypto, setSelectedCrypto] = useState('BTC');
  const [chart1, setChart1] = useState(null);
  const [chart2, setChart2] = useState(null);
  const [chart3, setChart3] = useState(null);
  const [chart4, setChart4] = useState(null);
  const [isDataFetched, setIsDataFetched] = useState(false);

  const toggleBigDesktop = (selected) => {
    setArimaSelected(selected === 'arima');
    setProphetSelected(selected === 'prophet');
    console.log(selected)
  };
  const handleCryptoChange = (event) => {
    setSelectedCrypto(event);
    console.log(event)
  };
  const dayChange = (selected) => {
    selectday1(selected === 'day1');
    selectday3(selected === 'day3');
    console.log(selected)
  };

  useEffect(() => {
    const fetchApi = async () => {
      try {
        const response = (await axios.get(`http://127.0.0.1:5000/?instId=${selectedCrypto}-USDT`));
        setIsDataFetched(true);
        return response;
      } catch (error) {
        console.error('Error fetching data:', error);
      };
    };
    const fetchData = async (response) => {
      try {
        console.log('processing:',response)
        if (response?.data) {
          let newchartRef1, newchartRef2, newchartRef3, newchartRef4;
          const stockData_one = await JSON.parse(response.data.full_data_one);
          const stockData_three = await JSON.parse(response.data.full_data_three);

          setApiData1(JSON.parse(response.data.full_data_one));
          setApiData2(JSON.parse(response.data.full_data_three));
          setPredictData1([JSON.parse(response.data.arima_predict.forecast_one), response.data.arima_predict.percentage_change_one]);
          setPredictData2([JSON.parse(response.data.arima_predict.forecast_three), response.data.arima_predict.percentage_change_three]);
          setProphetData1(JSON.parse(response.data.prophet_predict.forecast_one));
          setProphetData2(JSON.parse(response.data.prophet_predict.forecast_three));
          setErrorData(response.data.error);
          // get dates and prices
          const dates_one = await stockData_one.map(entry => new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
          const prices_one = await stockData_one.map(entry => entry.close);
          const dates_three = await stockData_three.map(entry => new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
          const prices_three = await stockData_three.map(entry => entry.close);
          // adding date
          let dates1_ten_days_later = [];
          let dates3_ten_days_later = [];
          let lastDateStr = dates_one[dates_one.length - 1];
          let newDate = new Date(lastDateStr);
          for (let i = 1; i <= 10; i++) {
            newDate.setDate(newDate.getDate() + i);
            dates1_ten_days_later.push(newDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
            dates3_ten_days_later.push(newDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
          }
          // combine price
          const combinedArray1 = [...prices_one, ...JSON.parse(response.data.arima_predict.forecast_one)];
          const combinedArray3 = [...prices_three, ...JSON.parse(response.data.arima_predict.forecast_three)];
          const combinedArrayProphet1 = [...prices_one, ...JSON.parse(response.data.prophet_predict.forecast_one).slice(-10).map(entry => entry.yhat)];
          const combinedArrayProphet3 = [...prices_three, ...JSON.parse(response.data.prophet_predict.forecast_three).slice(-10).map(entry => entry.yhat)];
          const ctx1 = document.getElementById('stockChart');
          const ctx2 = document.getElementById('stockChart2');
          const ctx3 = document.getElementById('stockChart3');
          const ctx4 = document.getElementById('stockChart4');
          // chart
          Chart.defaults.color = "rgb(39, 54, 43)";
          if (ctx1) {
            newchartRef1 = new Chart(ctx1.getContext('2d'), {
              type: 'line',
              data: {
                labels: [...dates_one, ...dates1_ten_days_later],
                datasets: [{
                  label: 'origin',
                  borderColor: (context) => {
                    const lastIndex = context.dataset.data.length - 1;
                    return context.dataIndex > lastIndex - 10 ? 'rgb(75, 192, 192)' : 'rgb(39, 54, 43)';
                  },
                  data: combinedArray1,
                }]
              },
              options: {
                scales: {
                  x: [{
                    type: 'time',
                    time: {
                      unit: 'day',
                    },
                    scaleLabel: {
                      display: true,
                      text: 'date',
                    },
                  }],
                  y: {
                    scaleLabel: {
                      display: true,
                      text: 'price',
                    },
                  },
                },
              },
            });
          } else if (ctx2) {
            newchartRef2 = new Chart(ctx2.getContext('2d'), {
              type: 'line',
              data: {
                labels: [...dates_three, ...dates3_ten_days_later],
                datasets: [{
                  label: 'originprice',
                  borderColor: (context) => {
                    const lastIndex = context.dataset.data.length - 1;
                    return context.dataIndex > lastIndex - 10 ? 'rgb(75, 192, 192)' : 'rgb(39, 54, 43)';
                  },
                  data: combinedArray3,
                }],
              },
              options: {
                scales: {
                  x: [{
                    type: 'time',
                    time: {
                      unit: 'day',
                    },
                    scaleLabel: {
                      display: true,
                      text: 'date',
                    },
                    }],
                  y: {
                    scaleLabel: {
                      display: true,
                      text: 'price',
                    },
                  },
                },
              },
            });
          } else if (ctx3) {
            newchartRef3 = new Chart(ctx3.getContext('2d'), {
              type: 'line',
              data: {
                labels: [...dates_one, ...dates1_ten_days_later],
                datasets: [{
                  label: 'origin',
                  borderColor: (context) => {
                    const lastIndex = context.dataset.data.length - 1;
                    return context.dataIndex > lastIndex - 10 ? 'rgb(75, 192, 192)' : 'rgb(39, 54, 43)';
                  },
                  data: combinedArrayProphet1,
                }]
              },
              options: {
                scales: {
                  x: [{
                    type: 'time',
                    time: {
                      unit: 'day',
                    },
                    scaleLabel: {
                      display: true,
                      text: 'date',
                    },
                  }],
                  y: {
                    scaleLabel: {
                      display: true,
                      text: 'price',
                    },
                  },
                },
              },
            });
          } else if (ctx4) {
            newchartRef4 = new Chart(ctx4.getContext('2d'), {
              type: 'line',
              data: {
                labels: [...dates_three, ...dates3_ten_days_later],
                datasets: [{
                  label: 'origin',
                  borderColor: (context) => {
                    const lastIndex = context.dataset.data.length - 1;
                    return context.dataIndex > lastIndex - 10 ? 'rgb(75, 192, 192)' : 'rgb(39, 54, 43)';
                  },
                  data: combinedArrayProphet3,
                }]
              },
              options: {
                scales: {
                  x: [{
                    type: 'time',
                    time: {
                      unit: 'day',
                    },
                    scaleLabel: {
                      display: true,
                      text: 'date',
                    },
                  }],
                  y: {
                    scaleLabel: {
                      display: true,
                      text: 'price',
                    },
                  },
                },
              },
            });
          };
          setChart1(newchartRef1);
          setChart2(newchartRef2);
          setChart3(newchartRef3);
          setChart4(newchartRef4);
        } else {
          throw new Error('havent get data');
        }
      } catch (error) {
        console.error('Error fetching data');
      }
    };
    let responseData;
    if (!isDataFetched) {
      fetchApi().then((response) => {
        responseData = response;
        fetchData(response);
      });
    } else {
      if (responseData) {
        fetchData(responseData);
      }
    }
  }, [chart1, chart2, chart3, chart4, toggleBigDesktop, handleCryptoChange, dayChange]);

  return (
    <main className="flex flex-col items-center p-4 h-screen">
      <section className="flex flex-col items-center justify-center w-full">
        <div className="mb-4 flex justify-start w-full">
        <a href="https://github.com/kennywang112">
          <Image
            src="/favicon.ico"
            alt="favicon"
            className="dark"
            width={30}
            height={24}
            priority
          /></a>
          <label htmlFor="selectOption" className="text-2xl font-semibold custom-font" style={{fontSize: '28px'}}>
            StoneTrader
          </label>
        <div style={{width: '20px'}}></div>
        <div>
          <select className="form-select select-button custom-font" id="crypto-select" style={{ fontSize: '20px' }} onChange={handleCryptoChange} value={selectedCrypto}>
              <option value="BTC">BTC</option>
              <option value="SOL">SOL</option>
            </select>
        </div>
        <div className="flex justify-end items-center flex-grow">
          <a href="https://github.com/kennywang112">
          <Image
            src="/github.ico"
            alt="github"
            className="dark:invert"
            width={30}
            height={24}
            priority
          /></a>
          <a href="https://kennywang112.github.io/Profile/">
          <Image
            src="/website.ico"
            alt="website"
            className="dark"
            width={30}
            height={24}
            priority
          /></a>
          <a href="https://www.linkedin.com/in/%E7%A5%81%E9%A8%AB-%E7%8E%8B-928017243/">
          <Image
            src="/linkedin.ico"
            alt="linkedin"
            className="dark"
            width={30}
            height={24}
            priority
          /></a>
          <a href="https://www.kaggle.com/kennyssss/code">
          <Image
            src="/kaggle.ico"
            alt="kaggle"
            className="dark"
            width={30}
            height={24}
            priority
          /></a>
        </div>
        </div>
        {/* 按鈕 */}
        <div className="mb-4 flex justify-between items-center button-bg">
          <div className="flex">
            <button onClick={() => toggleBigDesktop('arima')} className={`text-2l font-semibold custom-font ${arimaSelected ? 'button-text-bg text-white' : ''}`}>
              ARIMA
            </button>
            <div style={{ width: '10px' }} />
            <button onClick={() => toggleBigDesktop('prophet')} className={`text-2l font-semibold custom-font ${prophetSelected ? 'button-text-bg text-white' : ''}`}>
              PROPHET
            </button>
          </div>
        </div>
        {/* arima */}
        {arimaSelected && (
          <div className="bigdesktop">
            <div className="flex">
              <button onClick={() => dayChange('day1')} className={`text-2l font-semibold custom-font ${day1selected ? 'button-text-bg text-white' : ''}`}>
                Day 1
              </button>
              <div style={{ width: '10px' }} />
              <button onClick={() => dayChange('day3')} className={`text-2l font-semibold custom-font ${day3selected ? 'button-text-bg text-white' : ''}`}>
                Day 3
              </button>
            </div>
          <div className="my-8"></div>
          {/* history and statistics */}
          {day1selected && (
          <div>
          <canvas id="stockChart" width="750" height="400"></canvas>
          <div className="flex justify-between w-full">
            {/* history */}
            <div className="w-10% desktop">
              {apiData1 && apiData1.length > 0 ? (
              <div className = "mt-8 overflow-y-auto table-container" style = {{ maxHeight: '250px' }}>
                <table>
                  <thead>
                    <tr className = "custom-font">
                      <th>Index</th>
                      <th>Open</th>
                      <th>High</th>
                      <th>Low</th>
                      <th>Close</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apiData1.map((item, index) => (
                      <tr key={index}>
                        <td className="with-border">{index}</td>
                        <td className="with-border">{item.open}</td>
                        <td className="with-border">{item.high}</td>
                        <td className="with-border">{item.low}</td>
                        <td>{item.close}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              ) : (
                <p>stock history</p>
              )}
            </div>
            {/* predict */}
            <div className="w-10% desktop">
              <div className="mt-8 overflow-y-auto table-container" style={{ maxHeight: '250px' }}>
                <table>
                  <thead>
                    <tr className = "custom-font">
                      <th>Day</th>
                      <th>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                  {predictData1 && predictData1[0].map((data, index) => (
                    <tr key={index}>
                      <td className = "with-border">{index}</td>
                      <td>{data.toFixed(3)}</td>
                    </tr>
                  ))}
                </tbody>
                </table>
              </div>
            </div>
            {/* statistics */}
            <div className="w-10% desktop">
              <p className="pb-2 custom-font">Statistic Base</p>
              <div className="mt-8 overflow-y-auto table-container" style={{ maxHeight: '200px' }}>
                <table>
                  <tbody>
                    <tr>
                      <td>Best pdq AIC : </td>
                      <td>[{errorData ? errorData.best_pdq_AIC_one : null}]</td>
                    </tr>
                    <tr>
                      <td>Best pdq BIC : </td>
                      <td>[{errorData ? errorData.best_pdq_MSE_one : null}]</td>
                    </tr>
                    <tr>
                      <td>Percent ten days : </td>
                      <td>{predictData1 ? predictData1[1].toFixed(2) : null} %</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          </div>
          )}
          {day3selected && (
          <div>
          <canvas id="stockChart2" width="750" height="400"></canvas>
          <div className="flex justify-between w-full">
            {/* history */}
            <div className="w-10% desktop">
              {apiData2 && apiData2.length > 0 ? (
              <div className = "mt-8 overflow-y-auto table-container" style = {{ maxHeight: '250px' }}>
                <table>
                  <thead>
                    <tr className = "custom-font">
                      <th>Index</th>
                      <th>Open</th>
                      <th>High</th>
                      <th>Low</th>
                      <th>Close</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apiData2.map((item, index) => (
                      <tr key={index}>
                        <td className="with-border">{index}</td>
                        <td className="with-border">{item.open}</td>
                        <td className="with-border">{item.high}</td>
                        <td className="with-border">{item.low}</td>
                        <td>{item.close}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              ) : (
                <p>stock history</p>
              )}
            </div>
            {/* predict */}
            <div className="w-10% desktop">
              <div className="mt-8 overflow-y-auto table-container" style={{ maxHeight: '250px' }}>
                <table>
                  <thead>
                    <tr className = "custom-font">
                      <th>Day</th>
                      <th>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                  {predictData1 && predictData1[0].map((data, index) => (
                    <tr key={index}>
                      <td className = "with-border">{index}</td>
                      <td>{data.toFixed(3)}</td>
                    </tr>
                  ))}
                </tbody>
                </table>
              </div>
            </div>
            {/* statistics */}
            <div className="w-10% desktop">
              <p className="pb-2 custom-font">Statistic Base</p>
              <div className="mt-8 overflow-y-auto table-container" style={{ maxHeight: '200px' }}>
                <table>
                  <tbody>
                    <tr>
                      <td>Best pdq AIC : </td>
                      <td>[{errorData ? errorData.best_pdq_AIC_three : null}]</td>
                    </tr>
                    <tr>
                      <td>Best pdq BIC : </td>
                      <td>[{errorData ? errorData.best_pdq_MSE_three : null}]</td>
                    </tr>
                    <tr>
                      <td>Percent ten days : </td>
                      <td>{predictData2 ? predictData2[1].toFixed(2) : null} %</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          </div>
          )}
        </div>
        )}
        {/* prophet */}
        {prophetSelected && (
          <div className="bigdesktop">
          <div className="flex">
            <button onClick={() => dayChange('day1')} className={`text-2l font-semibold custom-font ${day1selected ? 'button-text-bg text-white' : ''}`}>
              Day 1
            </button>
            <div style={{ width: '10px' }} />
            <button onClick={() => dayChange('day3')} className={`text-2l font-semibold custom-font ${day3selected ? 'button-text-bg text-white' : ''}`}>
              Day 3
            </button>
          </div>
        <div className="my-8"></div>
        {/* history and statistics */}
        {day1selected && (
        <div>
        <canvas id="stockChart3" width="750" height="400"></canvas>
        <div className="flex justify-between w-full">
          {/* history */}
          <div className="w-10% desktop">
            {apiData1 && apiData1.length > 0 ? (
            <div className = "mt-8 overflow-y-auto table-container" style = {{ maxHeight: '250px' }}>
              <table>
                <thead>
                  <tr className = "custom-font">
                    <th>Index</th>
                    <th>Open</th>
                    <th>High</th>
                    <th>Low</th>
                    <th>Close</th>
                  </tr>
                </thead>
                <tbody>
                  {apiData1.map((item, index) => (
                    <tr key={index}>
                      <td className="with-border">{index}</td>
                      <td className="with-border">{item.open}</td>
                      <td className="with-border">{item.high}</td>
                      <td className="with-border">{item.low}</td>
                      <td>{item.close}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            ) : (
              <p>stock history</p>
            )}
          </div>
          {/* predict */}
          <div className="w-10% desktop">
            <div className="mt-8 overflow-y-auto table-container" style={{ maxHeight: '250px' }}>
              <table>
                <thead>
                  <tr className = "custom-font">
                    <th>Day</th>
                    <th>Price</th>
                    <th>Upper</th>
                    <th>Lower</th>
                  </tr>
                </thead>
                <tbody>
                {prophetData1 && prophetData1.map((data, index) => (
                  <tr key={index}>
                    <td className = "with-border">{index}</td>
                    <td>{data.yhat.toFixed(1)}</td>
                    <td>{data.yhat_lower.toFixed(1)}</td>
                    <td>{data.yhat_upper.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
              </table>
            </div>
          </div>
          {/* statistics */}
          <div className="w-10% desktop">
            <p className="pb-2 custom-font">Statistic Base</p>
            <div className="mt-8 overflow-y-auto table-container" style={{ maxHeight: '200px' }}>
              <table>
                <tbody>
                  <tr>
                    <td>Best pdq AIC : </td>
                    <td>[{errorData ? errorData.best_pdq_AIC_one : null}]</td>
                  </tr>
                  <tr>
                    <td>Best pdq BIC : </td>
                    <td>[{errorData ? errorData.best_pdq_MSE_one : null}]</td>
                  </tr>
                  <tr>
                    <td>Percent ten days : </td>
                    <td>{predictData1 ? predictData1[1].toFixed(2) : null} %</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        </div>
        )}
        {day3selected && (
        <div>
        <canvas id="stockChart4" width="750" height="400"></canvas>
        <div className="flex justify-between w-full">
          {/* history */}
          <div className="w-10% desktop">
            {apiData2 && apiData2.length > 0 ? (
            <div className = "mt-8 overflow-y-auto table-container" style = {{ maxHeight: '250px' }}>
              <table>
                <thead>
                  <tr className = "custom-font">
                    <th>Index</th>
                    <th>Open</th>
                    <th>High</th>
                    <th>Low</th>
                    <th>Close</th>
                  </tr>
                </thead>
                <tbody>
                  {apiData2.map((item, index) => (
                    <tr key={index}>
                      <td className="with-border">{index}</td>
                      <td className="with-border">{item.open}</td>
                      <td className="with-border">{item.high}</td>
                      <td className="with-border">{item.low}</td>
                      <td>{item.close}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            ) : (
              <p>stock history</p>
            )}
          </div>
          {/* predict */}
          <div className="w-10% desktop">
            <div className="mt-8 overflow-y-auto table-container" style={{ maxHeight: '250px' }}>
              <table>
                <thead>
                  <tr className = "custom-font">
                    <th>Day</th>
                    <th>Price</th>
                    <th>Upper</th>
                    <th>Lower</th>
                  </tr>
                </thead>
                <tbody>
                {prophetData2 && prophetData2.map((data, index) => (
                  <tr key={index}>
                    <td className = "with-border">{index}</td>
                    <td>{data.yhat.toFixed(1)}</td>
                    <td>{data.yhat_lower.toFixed(1)}</td>
                    <td>{data.yhat_upper.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
              </table>
            </div>
          </div>
          {/* statistics */}
          <div className="w-10% desktop">
            <p className="pb-2 custom-font">Statistic Base</p>
            <div className="mt-8 overflow-y-auto table-container" style={{ maxHeight: '200px' }}>
              <table>
                <tbody>
                  <tr>
                    <td>Best pdq AIC : </td>
                    <td>[{errorData ? errorData.best_pdq_AIC_three : null}]</td>
                  </tr>
                  <tr>
                    <td>Best pdq BIC : </td>
                    <td>[{errorData ? errorData.best_pdq_MSE_three : null}]</td>
                  </tr>
                  <tr>
                    <td>Percent ten days : </td>
                    <td>{predictData2 ? predictData2[1].toFixed(2) : null} %</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        </div>
        )}
      </div>
        )}
      </section>
    </main>
  );
}
