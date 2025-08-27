import React, { useEffect, useState } from 'react';
import { BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from 'recharts';

const API_URL = `${window.location.protocol}//${window.location.hostname}:3001`;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const Stats = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${API_URL}/stats`);
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div>Loading stats...</div>;
  }

  if (!stats) {
    return <div>Failed to load stats.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Statistics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h2 className="text-xl font-bold mb-2">Submissions by Station</h2>
          {stats.submissions_by_station && (
            <BarChart width={500} height={300} data={stats.submissions_by_station}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="station_id" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" fill="#8884d8" />
            </BarChart>
          )}
        </div>

        <div>
          <h2 className="text-xl font-bold mb-2">Answers by Type</h2>
          {stats.answers_by_type && (
            <PieChart width={400} height={400}>
              <Pie data={stats.answers_by_type} dataKey="total" nameKey="type" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                {stats.answers_by_type.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          )}
        </div>

        <div>
          <h2 className="text-xl font-bold mb-2">Age Distribution</h2>
          {stats.age_distribution && (
            <BarChart width={500} height={300} data={stats.age_distribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="age" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" fill="#82ca9d" />
            </BarChart>
          )}
        </div>

        <div>
          <h2 className="text-xl font-bold mb-2">Gender Distribution</h2>
          {stats.gender_distribution && (
            <BarChart width={500} height={300} data={stats.gender_distribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="gender" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" fill="#ffc658" />
            </BarChart>
          )}
        </div>

        <div>
          <h2 className="text-xl font-bold mb-2">Resident Distribution</h2>
          {stats.resident_distribution && (
            <PieChart width={400} height={400}>
              <Pie data={stats.resident_distribution.map((d: any) => ({ ...d, name: d.resident ? 'Resident' : 'Non-resident' }))} dataKey="total" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                {stats.resident_distribution.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          )}
        </div>
      </div>
    </div>
  );
};

export default Stats;
