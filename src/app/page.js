"use client";

import Image from "next/image";
import { useEffect, useState } from 'react';
import axios from 'axios';
import Chart from 'chart.js/auto';

export default function Home() {

  // let chartRef;
  const [selectedOption, setSelectedOption] = useState('');
  const [apiData, setApiData] = useState(null);
  const [errorData, setErrorData] = useState(null);
  const [predictData, setPredictData] = useState(null);

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
        setApiData(JSON.parse(response.data.full_data));
        setErrorData(response.data.error);
        setPredictData([JSON.parse(response.data.predict.forecast), response.data.predict.percentage_change]);
        const stockData = JSON.parse(response.data.full_data);
        // get dates and prices
        const dates = stockData.map(entry => new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
        const prices = stockData.map(entry => entry.close);
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
                labels: dates,
                datasets: [{
                    label: '股價',
                    borderColor: 'rgb(75, 192, 192)',
                    data: prices,
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
                labels: dates,
                datasets: [{
                    label: '股價',
                    borderColor: 'rgb(75, 192, 192)',
                    data: prices,
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
    console.log(errorData);
  }, [errorData]);
  useEffect(() => {
    console.log(predictData);
  }, [predictData]);

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
            10 days avg chart
            <canvas id="stockChart" width="600" height="400"></canvas>
          </div>
          <div className="w-50%">
            {/* chart */}
            1 week avg chart
            <canvas id="stockChart2" width="600" height="400"></canvas>
          </div>
        </div>
        <div className="my-8"></div>
        {/* history and statistics */}
        <div className="flex justify-between w-full">
          {/* history */}
          <div className="w-10% desktop">
          <h2 className="pb-2">10 Days</h2>
            {apiData && apiData.length > 0 ? (
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
                  {apiData.map((item, index) => (
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
          <h2 className="pb-2">1 Week</h2>
            {apiData && apiData.length > 0 ? (
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
                  {apiData.map((item, index) => (
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
            <p className="border-b pb-2">Predict</p>
            <div className="mt-8 overflow-y-auto" style={{ maxHeight: '200px' }}>
              <table>
              <thead>
                <tr className = "border-b">
                  <th>Day</th>
                  <th>Predict price</th>
                </tr>
              </thead>
              {predictData && predictData[0].map((data, index) => (
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
            <p className="border-b pb-2">statistic</p>
            <div className="mt-8 overflow-y-auto" style={{ maxHeight: '200px' }}>
              <table>
                <tbody>
                  <tr>
                    <td>Best pdq AIC : </td>
                    <td>[{errorData ? errorData.best_pdq_AIC : null}]</td>
                  </tr>
                  <tr>
                    <td>Best pdq BIC : </td>
                    <td>[{errorData ? errorData.best_pdq_MSE : null}]</td>
                  </tr>
                  <tr>
                    <td>Percent ten days after : </td>
                    <td>{predictData ? predictData[1].toFixed(2) : null} %</td>
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
