"use client";

import Image from "next/image";
import { useEffect, useState } from 'react';
import axios from 'axios';
import Chart from 'chart.js/auto';

export default function Home() {

  // let chartRef;
  const [selectedOption, setSelectedOption] = useState('');
  const [apiData, setApiData] = useState(null);

  const handleSelectChange = (event) => {
    setSelectedOption(event.target.value);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // if (selectedOption) {
          console.log('fetching');
          // Use a relative path instead of an absolute URL
          const response = await axios.get("http://127.0.0.1:5000/");
  
          setApiData(response.data);
          const stockData = response.data;
          // get dates and prices
          const dates = stockData.map(entry => new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
          const prices = stockData.map(entry => entry.close);
          // Chart.js
          const ctx = document.getElementById('stockChart').getContext('2d');
          const ctx2 = document.getElementById('stockChart2').getContext('2d');
          const chartRef = new Chart(ctx, {
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
          console.log(chartRef);
          const chartRef2 = new Chart(ctx2, {
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
        // }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
  
    fetchData();
  }, [selectedOption]);

  return (
    <main className="flex flex-col items-center p-8 h-screen">
      <section className="flex flex-col items-center justify-center p-8 w-full">
        {/* choose model */}
        <div className="mt-8">
          <label htmlFor="selectOption" className="text-2xl font-semibold mb-2">
            Model:
          </label>
          <select
            id="selectOption"
            value={selectedOption}
            onChange={handleSelectChange}
            className="p-2 border border-gray-300 rounded-md"
          >
            <option value="">choose</option>
            <option value="option1">ARIMA</option>
            <option value="option2">Profit</option>
          </select>
  
          {selectedOption && (
            <p className="mt-2">selected:{selectedOption}</p>
          )}
        </div>
        <div className="my-8"></div>
        {/* pred */}
        <div className="flex justify-between w-full">
          <div className="w-50%">
            {/* chart */}
            predict chart
            <canvas id="stockChart" width="500" height="400"></canvas>
          </div>
          <div className="w-50%">
            {/* chart */}
            predict chart
            <canvas id="stockChart2" width="500" height="400"></canvas>
          </div>
        </div>
        <div className="my-8"></div>
        {/* history and statistics */}
        <div className="flex justify-between w-full">
          <div className="w-30%">
              {apiData && apiData.length > 0 ? (
              <div className = "mt-8 overflow-y-auto" style = {{ maxHeight: '200px' }}>
                <h2>Data from API:</h2>
                <table>
                  <thead>
                    <tr>
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
                        <td>{index}</td>
                        <td>{item.open}</td>
                        <td>{item.high}</td>
                        <td>{item.low}</td>
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
          <div className="w-30%">
              {apiData && apiData.length > 0 ? (
              <div className = "mt-8 overflow-y-auto" style = {{ maxHeight: '200px' }}>
                <h2>Data from API:</h2>
                <table>
                  <thead>
                    <tr>
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
                        <td>{index}</td>
                        <td>{item.open}</td>
                        <td>{item.high}</td>
                        <td>{item.low}</td>
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
          <div className="w-30%">
            <p>statistic</p>
          </div>
        </div>
      </section>
    </main>
  );
  
}
