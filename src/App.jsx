import React, { useState } from 'react';
import {
  Container,
  TextField,
  Slider,
  Button,
  Typography,
} from 'https://cdn.skypack.dev/@mui/material';

const factors = [
  'Problema real y doloroso',
  'Mercado grande y en crecimiento',
  'Soluci\u00f3n diferenciada y simple',
  'Ventaja competitiva',
  'Modelo de negocio s\u00f3lido',
  'Tracci\u00f3n o validaci\u00f3n temprana',
  'Equipo fundador fuerte y con insight \u00fanico',
  'Go-to-market estrat\u00e9gico',
  'Escalabilidad del producto',
  'Velocidad de ejecuci\u00f3n / foco',
];

function Question({ label, value, onChange }) {
  return (
    <div className="my-4">
      <Typography variant="subtitle1" className="text-gray-700">{label}</Typography>
      <Slider
        value={value}
        onChange={(_, val) => onChange(val)}
        min={1}
        max={100}
        step={1}
        valueLabelDisplay="auto"
        aria-labelledby={label}
      />
    </div>
  );
}

export default function App() {
  const [answers, setAnswers] = useState(() =>
    factors.map(() => [50, 50, 50])
  );

  const handleChange = (factorIndex, questionIndex, newVal) => {
    setAnswers((prev) => {
      const copy = [...prev];
      copy[factorIndex][questionIndex] = newVal;
      return copy;
    });
  };

  const handleSubmit = async () => {
    const data = factors.map((factor, idx) => ({
      factor,
      q1: answers[idx][0],
      q2: answers[idx][1],
      q3: answers[idx][2],
    }));

    try {
      // TODO: replace SHEET_ID and API_KEY with real values
      const sheetId = 'SHEET_ID';
      const apiKey = 'API_KEY';
      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Respuestas:append?valueInputOption=USER_ENTERED&key=${apiKey}`,
        {
          method: 'POST',
          body: JSON.stringify({ values: data.map((d) => Object.values(d)) }),
          headers: { 'Content-Type': 'application/json' },
        }
      );
      alert('Respuestas enviadas');
    } catch (e) {
      console.error(e);
      alert('Error al enviar datos');
    }
  };

  return (
    <Container className="max-w-3xl mx-auto p-4">
      <Typography variant="h4" gutterBottom className="text-blue-800">
        Evaluaci\u00f3n de Emprendimiento
      </Typography>
      {factors.map((factor, idx) => (
        <div key={factor} className="my-6 p-4 bg-white rounded shadow-sm">
          <Typography variant="h6" className="text-green-700 mb-2">
            {`#${idx + 1} ${factor}`}
          </Typography>
          {[1, 2, 3].map((q) => (
            <Question
              key={q}
              label={`Pregunta ${q}`}
              value={answers[idx][q - 1]}
              onChange={(val) => handleChange(idx, q - 1, val)}
            />
          ))}
        </div>
      ))}
      <Button
        variant="contained"
        className="bg-yellow-500 hover:bg-yellow-600 mt-4"
        onClick={handleSubmit}
      >
        Enviar
      </Button>
    </Container>
  );
}
