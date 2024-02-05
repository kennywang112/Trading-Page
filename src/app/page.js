"use client";

import Image from "next/image";
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Home() {

  const [selectedOption, setSelectedOption] = useState('');
  const [apiData, setApiData] = useState(null);

  const handleSelectChange = (event) => {
    setSelectedOption(event.target.value);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (selectedOption) {
          console.log('fetching');
          
          // Use a relative path instead of an absolute URL
          const response = await axios.get("http://127.0.0.1:5000/");
  
          setApiData(response.data);
          console.log(response.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
  
    fetchData();
  }, [selectedOption]);

  return (
    <main className="flex flex-col items-center p-8 h-screen">
      <section className="flex flex-col items-center justify-center p-8 w-full">
        {/* 下拉式選單 */}
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
        <div className="my-16"></div>
        {/* pred */}
        <div className="flex justify-between w-full">
          <div className="w-30%">
            {/* 這裡插入實際的圖表組件 */}
            predict chart
            <Image
              className="relative dark:drop-shadow-[0_0_0.3rem_#ffffff70] dark:invert"
              src="/next.svg"
              alt="Next.js Logo"
              width={800} // 設置圖像寬度
              height={1800} // 設置圖像高度
              priority
            />
          </div>
          <div className="w-30%">
            {/* 這裡插入實際的圖表組件 */}
            predict chart
            <Image
              className="relative dark:drop-shadow-[0_0_0.3rem_#ffffff70] dark:invert"
              src="/next.svg"
              alt="Next.js Logo"
              width={800} // 設置圖像寬度
              height={1800} // 設置圖像高度
              priority
            />
          </div>
        </div>
        <div className="my-16"></div>
        {/* 表格和統計數據 */}
        <div className="flex justify-between w-full">
          <div className="w-30%">
              {apiData && (
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
            )}
          </div>
          <div className="w-30%">
            <p>統計數值:123</p>
          </div>
        </div>
      </section>
    </main>
  );
  
}
