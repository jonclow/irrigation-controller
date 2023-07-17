import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useLoaderData } from 'react-router-dom';

function RainGraph() {
  const { rain_data } = useLoaderData();

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        width={500}
        height={300}
        data={rain_data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="rain_day" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="total_rain" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  )
}

export default RainGraph;
