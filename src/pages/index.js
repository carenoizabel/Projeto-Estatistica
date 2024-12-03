import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Button, TextField, Typography, Alert, Box } from '@mui/material';
import { Chart as ChartJS, LineElement, PointElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from 'chart.js';
ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

const LineChart = dynamic(() => import('react-chartjs-2').then((mod) => mod.Line), {
  ssr: false,
});

export default function Home() {
  const [chuvas, setChuvas] = useState([]);
  const [producoes, setProducoes] = useState([]);
  const [chuvaInput, setChuvaInput] = useState('');
  const [producaoInput, setProducaoInput] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [correlacao, setCorrelacao] = useState(null);
  const [forcaCorrelacao, setForcaCorrelacao] = useState('');
  const MAX_ENTRIES = 10;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedChuvas = localStorage.getItem('chuvas');
      const savedProducoes = localStorage.getItem('producoes');
      if (savedChuvas) setChuvas(JSON.parse(savedChuvas));
      if (savedProducoes) setProducoes(JSON.parse(savedProducoes));
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('chuvas', JSON.stringify(chuvas));
      localStorage.setItem('producoes', JSON.stringify(producoes));
    }
  }, [chuvas, producoes]);

  const validateInput = () => {
    if (!chuvaInput || !producaoInput) {
      setError('Por favor, preencha ambos os campos.');
      return false;
    }
    if (isNaN(chuvaInput) || isNaN(producaoInput) || Number(chuvaInput) <= 0 || Number(producaoInput) <= 0) {
      setError('Os valores devem ser números positivos.');
      return false;
    }
    if (chuvas.length >= MAX_ENTRIES) {
      setError('Você atingiu o limite máximo de entradas.');
      return false;
    }
    setError('');
    return true;
  };

  const calcularCorrelacao = () => {
    if (chuvas.length < 2 || producoes.length < 2) {
      setCorrelacao(null);
      setForcaCorrelacao('');
      return; 
    }
  
    const n = chuvas.length;
    const sumX = chuvas.reduce((acc, val) => acc + val, 0);
    const sumY = producoes.reduce((acc, val) => acc + val, 0);
    const sumXY = chuvas.reduce((acc, val, idx) => acc + val * producoes[idx], 0);
    const sumX2 = chuvas.reduce((acc, val) => acc + val * val, 0);
    const sumY2 = producoes.reduce((acc, val) => acc + val * val, 0);
  
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  
    if (denominator === 0) {
      setCorrelacao(null); 
      setForcaCorrelacao('Correlação indefinida');
      return;
    }
  
    const r = numerator / denominator;
    setCorrelacao(r);
  
    if (r >= 0.7) {
      setForcaCorrelacao('Correlação forte');
    } else if (r <= -0.7) {
      setForcaCorrelacao('Correlação negativa forte');
    } else if (r >= 0.3) {
      setForcaCorrelacao('Correlação moderada');
    } else if (r <= -0.3) {
      setForcaCorrelacao('Correlação negativa moderada');
    } else {
      setForcaCorrelacao('Correlação fraca');
    }
  };

  const handleAddData = () => {
    if (validateInput()) {
      setChuvas([...chuvas, Number(chuvaInput)]);
      setProducoes([...producoes, Number(producaoInput)]);
      setChuvaInput('');
      setProducaoInput('');
      setSuccess('Dados adicionados com sucesso!');
      calcularCorrelacao(); 
    }
  };

  const handleClearData = () => {
    setChuvas([]);
    setProducoes([]);
    setCorrelacao(null);
    setForcaCorrelacao('');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('chuvas');
      localStorage.removeItem('producoes');
    }
    setError('');
    setSuccess('Todos os dados foram apagados.');
  };

  const chartData = {
    labels: chuvas,
    datasets: [
      {
        label: 'Produção Agrícola (ton)',
        data: producoes,
        borderColor: '#d940b3',
        backgroundColor: 'rgba(217, 64, 179, 0.2)',
        tension: 0.4,
      },
    ],
  };

  return (
    <Box sx={{ maxWidth: 600, margin: '0 auto', textAlign: 'center', padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Relação Pluviométrica de Produtividade
      </Typography>

      {error && <Alert severity="error" sx={{ marginBottom: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ marginBottom: 2 }}>{success}</Alert>}

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, marginBottom: 2 }}>
        <TextField
          label="Chuva (mm)"
          variant="outlined"
          value={chuvaInput}
          onChange={(e) => setChuvaInput(e.target.value)}
        />
        <TextField
          label="Produção Agrícola (ton)"
          variant="outlined"
          value={producaoInput}
          onChange={(e) => setProducaoInput(e.target.value)}
        />
      </Box>

      <Button variant="contained" color="primary" onClick={handleAddData} sx={{ marginRight: 2 }}>
        Adicionar Dados
      </Button>
      <Button variant="outlined" color="secondary" onClick={handleClearData}>
        Limpar Dados
      </Button>

      {correlacao !== null && (
        <Box sx={{ marginTop: 2 }}>
          <Typography variant="h6">
            Correlação: {correlacao.toFixed(2)}
          </Typography>
          <Typography variant="h6" color={correlacao >= 0.7 || correlacao <= -0.7 ? 'green' : 'orange'}>
            {forcaCorrelacao}
          </Typography>
        </Box>
      )}

      <Box sx={{ marginTop: 4 }}>
        <LineChart
          data={chartData}
          options={{
            responsive: true,
            plugins: {
              legend: { display: true, position: 'top' },
              tooltip: { enabled: true },
            },
            scales: {
              x: {
                title: { display: true, text: 'Chuva (mm)', color: '#8cbfe6' },
              },
              y: {
                title: { display: true, text: 'Produção Agrícola (ton)', color: '#66ffff' },
              },
            },
          }}
        />
      </Box>

      {forcaCorrelacao && (
        <Box sx={{ marginTop: 4 }}>
          <Typography variant="body1">
            {forcaCorrelacao === 'Correlação forte' || forcaCorrelacao === 'Correlação negativa forte'
              ? 'Há uma relação significativa entre a chuva e a produção.'
              : 'A relação entre a chuva e a produção é fraca ou moderada.'}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
