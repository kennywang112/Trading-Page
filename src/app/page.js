"use client";

import Image from "next/image";
import { useEffect, useState } from 'react';
import axios from 'axios';
import Chart from 'chart.js/auto';

export default function Home() {

  // let chartRef;
  const [selectedOption, setSelectedOption] = useState('');
  const [apiData1, setApiData1] = useState(null);
  const [predictData1, setPredictData1] = useState(null);

  const [apiData2, setApiData2] = useState(null);
  const [predictData2, setPredictData2] = useState(null);

  const [errorData, setErrorData] = useState(null);

  const [chartRef1, setChartRef1] = useState(null);
  const [chartRef2, setChartRef2] = useState(null);

  const handleSelectChange = (event) => {
    setSelectedOption(event.target.value);
  };

  useEffect(() => {

    const fetchData = async () => {

      try {
        // Use a relative path instead of an absolute URL
        const response = await axios.get("http://127.0.0.1:5000/");
        
        setApiData1(JSON.parse(response.data.full_data_one));
        setPredictData1([JSON.parse(response.data.predict.forecast_one), response.data.predict.percentage_change_one]);
        const stockData_one = JSON.parse(response.data.full_data_one);

        setApiData2(JSON.parse(response.data.full_data_three));
        setPredictData2([JSON.parse(response.data.predict.forecast_three), response.data.predict.percentage_change_three]);
        const stockData_three = JSON.parse(response.data.full_data_three);

        setErrorData(response.data.error);
        
        // get dates and prices
        const dates_one = stockData_one.map(entry => new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
        const prices_one = stockData_one.map(entry => entry.close);
        const dates_three = stockData_three.map(entry => new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
        const prices_three = stockData_three.map(entry => entry.close);
        // Chart.js
        const ctx = document.getElementById('stockChart').getContext('2d');
        const ctx2 = document.getElementById('stockChart2').getContext('2d');

        // Destroy previous chart instances
        if (chartRef1) {
          chartRef1.destroy();
        }
        if (chartRef2) {
          chartRef2.destroy();
        }
        const newChartRef1 = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates_one,
                datasets: [{
                    label: '股價',
                    borderColor: 'rgb(75, 192, 192)',
                    data: prices_one,
                }],
            },
            options: {
                scales: {
                    x: [{
                        type: 'time',
                        time: {
                            unit: 'day',  // 根據你的數據間隔調整
                        },
                        title: {
                            display: true,
                            text: '日期',
                        },
                    }],
                    y: {
                        title: {
                            display: true,
                            text: '股價',
                        },
                    },
                },
            },
        });
        const newChartRef2 = new Chart(ctx2, {
            type: 'line',
            data: {
                labels: dates_three,
                datasets: [{
                    label: '股價',
                    borderColor: 'rgb(75, 192, 192)',
                    data: prices_three,
                }],
            },
            options: {
                scales: {
                    x: [{
                        type: 'time',
                        time: {
                            unit: 'day',  // 根據你的數據間隔調整
                        },
                        title: {
                            display: true,
                            text: '日期',
                        },
                    }],
                    y: {
                        title: {
                            display: true,
                            text: '股價',
                        },
                    },
                },
            },
        });
        setChartRef1(newChartRef1);
        setChartRef2(newChartRef2);

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
  
    fetchData();
  }, [selectedOption]);

  useEffect(() => {
    console.log(1);
  }, [errorData, predictData1, predictData2]);

  return (
    <main className="flex flex-col items-center p-8 h-screen">
      <section className="flex flex-col items-center justify-center p-8 w-full">
        {/* choose model */}
        <div className="mt-8 flex justify-start">
          <label htmlFor="selectOption" className="text-2xl font-semibold mb-2">
            StoneTrader
          </label>
          <select
            id="selectOption"
            value={selectedOption}
            onChange={handleSelectChange}
            className="p-2 border border-gray-300 rounded-md"
          >
            <option value="">model</option>
            <option value="option1">ARIMA</option>
            <option value="option2">Profit</option>
          </select>
        </div>
        <div className="my-8"></div>
        {/* pred */}
        <div className="flex justify-between w-full">
          <div className="w-50%">
            {/* chart */}
            1 days avg chart
            <canvas id="stockChart" width="600" height="400"></canvas>
          </div>
          <div className="w-50%">
            {/* chart */}
            3 days avg chart
            <canvas id="stockChart2" width="600" height="400"></canvas>
          </div>
        </div>
        <div className="my-8"></div>
        {/* history and statistics */}
        <div className="flex justify-between w-full">
          {/* history */}
          <div className="w-10% desktop">
          <h2 className="pb-2">1 Days</h2>
            {apiData1 && apiData1.length > 0 ? (
            <div className = "mt-8 overflow-y-auto" style = {{ maxHeight: '200px' }}>
              <table>
                <thead>
                  <tr className = "border-b">
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
          <div className="w-10% desktop">
          <h2 className="pb-2">3 days</h2>
            {apiData2 && apiData2.length > 0 ? (
            <div className = "mt-8 overflow-y-auto" style = {{ maxHeight: '200px' }}>
              <table>
                <thead>
                  <tr className = "border-b">
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
            <p className="pb-2">Predict</p>
            <div className="mt-8 overflow-y-auto" style={{ maxHeight: '200px' }}>
              <table>
              <thead>
                <tr className = "border-b">
                  <th>Day</th>
                  <th>Predict price</th>
                </tr>
              </thead>
              {predictData1 && predictData1[0].map((data, index) => (
                <tr key={index}>
                  <td className = "with-border">{index}</td>
                  <td>{data}</td>
                </tr>
              ))}
              </table>
            </div>
          </div>
          {/* statistics */}
          <div className="w-10% desktop">
            <p className="pb-2">Statistic Base</p>
            <div className="mt-8 overflow-y-auto" style={{ maxHeight: '200px' }}>
              <table>
                <thead>
                  <tr className = "border-b">
                    <th>1 Day</th>
                  </tr>
                </thead>
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
                    <td>Percent ten days after : </td>
                    <td>{predictData1 ? predictData1[1].toFixed(2) : null} %</td>
                  </tr>
                </tbody>
              </table>
              <table>
                <thead>
                  <tr className = "border-b">
                    <th>3 Days</th>
                  </tr>
                </thead>
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
                    <td>Percent ten days after : </td>
                    <td>{predictData2 ? predictData2[1].toFixed(2) : null} %</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
  
}
