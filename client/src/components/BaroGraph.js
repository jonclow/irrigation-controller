import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useLoaderData } from 'react-router-dom';

function BaroGraph() {
  const { baro_data } = useLoaderData();

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        width={500}
        height={300}
        data={baro_data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date_time" angle={45} tickMargin={5} />
        <YAxis yAxisId="left" domain={[980, 1020]} />
        <Tooltip />
        <Line yAxisId="left" type="monotone" dataKey="baro" stroke="#8884d8" activeDot={{ r: 8 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}

export default BaroGraph;
