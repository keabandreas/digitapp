const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
app.use(cors());
app.use(express.json());
const CSV_PATH = process.env.CSV_PATH || '/app/completions.csv';

app.get('/api/statistics/keab-training-data', (req, res) => {
  console.log('Received request for CSV data');
  try {
    const csvData = fs.readFileSync(CSV_PATH, 'utf8');
    console.log('CSV data read successfully. First 100 chars:', csvData.substring(0, 100));
    res.send(csvData);
  } catch (error) {
    console.error('Error reading CSV file:', error);
    res.status(500).send('Error reading CSV file');
  }
});

app.post('/api/statistics/add-csv-row', (req, res) => {
  console.log('Received request to add CSV row:', req.body);
  const newRow = Object.values(req.body).join(',') + '\n';
  fs.appendFile(CSV_PATH, newRow, (err) => {
    if (err) {
      console.error('Error appending to file:', err);
      return res.status(500).json({ error: 'Error adding row to CSV' });
    }
    console.log('Row added successfully');
    res.status(200).json({ message: 'Row added successfully' });
  });
});

app.post('/api/statistics/remove-csv-row', (req, res) => {
  console.log('Received request to remove CSV row:', req.body);
  const { index } = req.body;
  fs.readFile(CSV_PATH, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading CSV file:', err);
      return res.status(500).json({ error: 'Error reading CSV file' });
    }
    const rows = data.split('\n');
    if (index < 1 || index >= rows.length) {
      console.error('Invalid row index:', index);
      return res.status(400).json({ error: 'Invalid row index' });
    }
    rows.splice(index, 1);
    const updatedCsv = rows.join('\n');
    fs.writeFile(CSV_PATH, updatedCsv, (err) => {
      if (err) {
        console.error('Error writing file:', err);
        return res.status(500).json({ error: 'Error updating CSV file' });
      }
      console.log('Row removed successfully');
      res.status(200).json({ message: 'Row removed successfully' });
    });
  });
});

app.post('/api/statistics/edit-csv-row', (req, res) => {
  console.log('Received request to edit CSV row:', req.body);
  const { index, data } = req.body;
  
  fs.readFile(CSV_PATH, 'utf8', (err, fileData) => {
    if (err) {
      console.error('Error reading CSV file:', err);
      return res.status(500).json({ error: 'Error reading CSV file' });
    }

    try {
      const rows = fileData.split('\n');
      const headers = rows[0].split(',');
      
      if (index < 0 || index >= rows.length - 1) {
        console.error('Invalid row index:', index);
        return res.status(400).json({ error: 'Invalid row index' });
      }

      const newRowArray = headers.map(header => {
        const value = data[header];
        return value !== undefined ? value : '';
      });
      const newRowString = newRowArray.join(',');
      
      rows[index + 1] = newRowString;
      const updatedCsv = rows.join('\n');
      
      fs.writeFile(CSV_PATH, updatedCsv, (writeErr) => {
        if (writeErr) {
          console.error('Error writing file:', writeErr);
          return res.status(500).json({ error: 'Error updating CSV file' });
        }
        console.log('Row edited successfully');
        res.status(200).json({ message: 'Row edited successfully' });
      });
    } catch (error) {
      console.error('Error processing CSV data:', error);
      res.status(500).json({ error: 'Error processing CSV data' });
    }
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Node server running at http://0.0.0.0:${PORT}`);
  console.log('CSV file path:', CSV_PATH);
});