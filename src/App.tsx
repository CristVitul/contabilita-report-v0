import './components/DataUploader.css'; // Aggiungi questa riga
import './App.css';
import { useState, useEffect, useRef } from 'react';
import DataUploader from './components/DataUploader'
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import Papa from 'papaparse';

export default function ContabilitaReport() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState([]);
  const [categorieAperte, setCategorieAperte] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [selectedStudio, setSelectedStudio] = useState('Tutti');
  const [selectedAnnoMese, setSelectedAnnoMese] = useState('Tutti'); // Nuovo stato per filtro Anno-Mese
  const [fileLoaded, setFileLoaded] = useState(false);
  const fileInputRef = useRef(null);

  // Funzione per convertire data in formato leggibile e ordinabile
  const parseDate = (dateStr) => {
    const monthMap = {
      'gen': '01', 'feb': '02', 'mar': '03', 'apr': '04',
      'mag': '05', 'giu': '06', 'lug': '07', 'ago': '08',
      'set': '09', 'ott': '10', 'nov': '11', 'dic': '12'
    };
    
    const [month, year] = dateStr.split('-');
    const fullYear = year.length === 2 ? `20${year}` : year;
    const monthNum = monthMap[month] || month;
    
    return {
      year: parseInt(fullYear),
      month: parseInt(monthNum),
      sortKey: `${fullYear}-${monthNum.padStart(2, '0')}`,
      displayKey: `${month}-${year}`
    };
  };

  // Funzione per ottenere la lista ordinata di Anno-Mese disponibili
  const getAvailableAnnoMese = () => {
    if (!data.length) return ['Tutti'];
    
    const dates = [...new Set(data.map(row => row.Date))];
    const parsedDates = dates.map(parseDate);
    
    // Ordina per anno e mese
    parsedDates.sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });
    
    return ['Tutti', ...parsedDates.map(d => d.displayKey)];
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const contents = e.target.result;
      
      Papa.parse(contents, {
        header: true,
        delimiter: ';',
        dynamicTyping: true,
        skipEmptyLines: true,
        transformHeader: header => header.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
        complete: (result) => {
          try {
            // Determina il formato del file in base alle intestazioni
            const headers = Object.keys(result.data[0]);
            const isNewFormat = headers.includes('anno') && headers.includes('mese') && headers.includes('importo');
            
            // Pulisci i dati e converti i valori numerici da formato italiano a numerico
            const cleanedData = result.data.map(row => {
              if (isNewFormat) {
                // Nuovo formato: anno;mese;studio;attività;wbs;importo;stanziamento/storno;metodologia;note
                const stanziamento = row['stanziamento/storno'] === 'stanziamento' ? parseFloat(String(row.importo).replace(',', '.')) || 0 : 0;
                const storno = row['stanziamento/storno'] === 'storno' ? parseFloat(String(row.importo).replace(',', '.')) || 0 : 0;
                
                return {
                  Date: `${row.mese.substring(0, 3)}-${String(row.anno).substring(2)}`, // Converti in formato 'mmm-yy'
                  Studio: row.studio,
                  Stanziamenti: stanziamento,
                  Storni: storno,
                  Categoria: row.attivita
                };
              } else {
                // Formato originale: Date;Studio;Stanziamenti;Storni;Categoria
                const cleanRow = {...row};
                if (typeof cleanRow.Stanziamenti === 'string') {
                  cleanRow.Stanziamenti = parseFloat(cleanRow.Stanziamenti.replace(',', '.')) || 0;
                } else if (cleanRow.Stanziamenti === null || cleanRow.Stanziamenti === undefined) {
                  cleanRow.Stanziamenti = 0;
                }
                
                if (typeof cleanRow.Storni === 'string') {
                  cleanRow.Storni = parseFloat(cleanRow.Storni.replace(',', '.')) || 0;
                } else if (cleanRow.Storni === null || cleanRow.Storni === undefined) {
                  cleanRow.Storni = 0;
                }
                
                return cleanRow;
              }
            });
            
            setData(cleanedData);
            processData(cleanedData);
            setLoading(false);
            setFileLoaded(true);
          } catch (err) {
            setError('Errore durante l\'elaborazione del file: ' + err.message);
            setLoading(false);
          }
        },
        error: (error) => {
          setError('Errore durante il parsing del file: ' + error.message);
          setLoading(false);
        }
      });
    };
    
    reader.onerror = () => {
      setError('Errore nella lettura del file');
      setLoading(false);
    };
    
    reader.readAsText(file);
  };

  const loadDemoData = () => {
    setLoading(true);
    
    // Dati di esempio integrati nel nuovo formato
    const demoData = [
      { Date: 'set-24', Studio: 'Apple', Stanziamenti: 4166, Storni: 0, Categoria: 'Field' },
      { Date: 'set-24', Studio: 'Pear', Stanziamenti: 2000, Storni: 0, Categoria: 'Field' },
      { Date: 'ott-24', Studio: 'Apple', Stanziamenti: 1218.93, Storni: 0, Categoria: 'Field' },
      { Date: 'ott-24', Studio: 'Apple', Stanziamenti: 5605, Storni: 0, Categoria: 'Incentivi' },
      { Date: 'ott-24', Studio: 'Pear', Stanziamenti: 1000, Storni: 0, Categoria: 'Incentivi' },
      { Date: 'ott-24', Studio: 'Pear', Stanziamenti: 0, Storni: 1000, Categoria: 'Field' },
      { Date: 'nov-24', Studio: 'Apple', Stanziamenti: 994, Storni: 0, Categoria: 'Field' },
      { Date: 'dic-24', Studio: 'Apple', Stanziamenti: 0, Storni: 5605, Categoria: 'Incentivi' },
      { Date: 'dic-24', Studio: 'Pear', Stanziamenti: 0, Storni: 500, Categoria: 'Field' },
      { Date: 'gen-25', Studio: 'Apple', Stanziamenti: 0, Storni: 2212.93, Categoria: 'Field' },
      { Date: 'feb-25', Studio: 'Apple', Stanziamenti: 0, Storni: 3000, Categoria: 'Field' },
      { Date: 'feb-25', Studio: 'Pear', Stanziamenti: 0, Storni: 500, Categoria: 'Field' },
      { Date: 'feb-25', Studio: 'Pear', Stanziamenti: 0, Storni: 1000, Categoria: 'Incentivi' }
    ];
    
    setData(demoData);
    processData(demoData);
    setLoading(false);
    setFileLoaded(true);
  };

  const processData = (data) => {
    // Raggruppa i dati per Studio e Categoria
    const groupedData = {};
    const studi = new Set();
    
    data.forEach(row => {
      const key = `${row.Studio}-${row.Categoria}`;
      studi.add(row.Studio);
      
      if (!groupedData[key]) {
        groupedData[key] = {
          Studio: row.Studio,
          Categoria: row.Categoria,
          TotaleStanziamenti: 0,
          TotaleStorni: 0,
          Saldo: 0,
          Movimenti: []
        };
      }
      
      // Aggiungi il movimento alla lista dei movimenti
      groupedData[key].Movimenti.push({
        Data: row.Date,
        Stanziamenti: row.Stanziamenti || 0,
        Storni: row.Storni || 0
      });
      
      // Aggiorna i totali
      groupedData[key].TotaleStanziamenti += row.Stanziamenti || 0;
      groupedData[key].TotaleStorni += row.Storni || 0;
      groupedData[key].Saldo = groupedData[key].TotaleStanziamenti - groupedData[key].TotaleStorni;
    });
    
    // Converti l'oggetto in array
    const summaryArray = Object.values(groupedData);
    
    // Calcola le categorie ancora aperte (saldo > 0)
    const aperte = summaryArray.filter(item => item.Saldo > 0);
    
    // Prepara i dati per il grafico
    const chartDataArray = summaryArray.map(item => ({
      name: `${item.Studio} - ${item.Categoria}`,
      Stanziamenti: item.TotaleStanziamenti,
      Storni: item.TotaleStorni,
      Saldo: item.Saldo,
      Studio: item.Studio
    }));
    
    setSummary(summaryArray);
    setCategorieAperte(aperte);
    setChartData(chartDataArray);
  };

  // Nuova funzione per filtrare i dati in base a Studio e Anno-Mese
  const filterData = (dataToFilter, studio, annoMese) => {
    let filtered = dataToFilter;
    
    // Filtra per Studio
    if (studio !== 'Tutti') {
      filtered = filtered.filter(item => item.Studio === studio);
    }
    
    // Filtra per Anno-Mese se specificato
    if (annoMese !== 'Tutti') {
      // Per i movimenti, filtra in base alla data
      filtered = filtered.map(item => {
        if (item.Movimenti) {
          // È un elemento del summary, filtra i movimenti
          const movimentiFiltrati = item.Movimenti.filter(mov => mov.Data === annoMese);
          if (movimentiFiltrati.length > 0) {
            // Ricalcola i totali basati sui movimenti filtrati
            const totaleStanziamenti = movimentiFiltrati.reduce((sum, mov) => sum + (mov.Stanziamenti || 0), 0);
            const totaleStorni = movimentiFiltrati.reduce((sum, mov) => sum + (mov.Storni || 0), 0);
            
            return {
              ...item,
              TotaleStanziamenti: totaleStanziamenti,
              TotaleStorni: totaleStorni,
              Saldo: totaleStanziamenti - totaleStorni,
              Movimenti: movimentiFiltrati
            };
          }
          return null; // Nessun movimento per questo periodo
        } else {
          // È un elemento del chartData
          return item;
        }
      }).filter(item => item !== null);
    }
    
    return filtered;
  };

  const getFilteredData = () => {
    // Filtra i dati raw per Anno-Mese se necessario
    let filteredRawData = data;
    if (selectedAnnoMese !== 'Tutti') {
      filteredRawData = data.filter(row => row.Date === selectedAnnoMese);
    }
    
    // Riprocessa i dati filtrati per ottenere summary aggiornato
    if (selectedAnnoMese !== 'Tutti') {
      const groupedData = {};
      
      filteredRawData.forEach(row => {
        const key = `${row.Studio}-${row.Categoria}`;
        
        if (!groupedData[key]) {
          groupedData[key] = {
            Studio: row.Studio,
            Categoria: row.Categoria,
            TotaleStanziamenti: 0,
            TotaleStorni: 0,
            Saldo: 0,
            Movimenti: []
          };
        }
        
        groupedData[key].Movimenti.push({
          Data: row.Date,
          Stanziamenti: row.Stanziamenti || 0,
          Storni: row.Storni || 0
        });
        
        groupedData[key].TotaleStanziamenti += row.Stanziamenti || 0;
        groupedData[key].TotaleStorni += row.Storni || 0;
        groupedData[key].Saldo = groupedData[key].TotaleStanziamenti - groupedData[key].TotaleStorni;
      });
      
      const filteredSummary = Object.values(groupedData);
      
      // Filtra per Studio
      return selectedStudio === 'Tutti' 
        ? filteredSummary 
        : filteredSummary.filter(item => item.Studio === selectedStudio);
    } else {
      // Usa il summary completo e filtra solo per Studio
      return selectedStudio === 'Tutti' 
        ? summary 
        : summary.filter(item => item.Studio === selectedStudio);
    }
  };

  const getFilteredChartData = () => {
    const filteredSummary = getFilteredData();
    return filteredSummary.map(item => ({
      name: `${item.Studio} - ${item.Categoria}`,
      Stanziamenti: item.TotaleStanziamenti,
      Storni: item.TotaleStorni,
      Saldo: item.Saldo,
      Studio: item.Studio
    }));
  };

  const getFilteredCategorieAperte = () => {
    const filteredSummary = getFilteredData();
    return filteredSummary.filter(item => item.Saldo > 0);
  };

  const resetData = () => {
    setData([]);
    setSummary([]);
    setCategorieAperte([]);
    setChartData([]);
    setFileLoaded(false);
    setSelectedStudio('Tutti');
    setSelectedAnnoMese('Tutti'); // Reset anche il filtro Anno-Mese
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (loading) {
    return <div className="p-4 bg-gray-100 rounded">Caricamento dei dati in corso...</div>;
  }

  const studi = fileLoaded ? ['Tutti', ...new Set(summary.map(item => item.Studio))] : ['Tutti'];
  const annoMeseOptions = getAvailableAnnoMese();

  return (
    <div className="p-4 bg-white rounded shadow max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Sistema di Verifica e Reporting Contabile</h1>
      
      {/* File upload section */}
      <div className="mb-8 p-4 border rounded bg-gray-50">
        <h2 className="text-xl font-semibold mb-4">Carica i tuoi dati</h2>
        <p className="mb-4">
          Carica un file CSV sia nel vecchio formato (Date;Studio;Stanziamenti;Storni;Categoria) o nel nuovo formato (anno;mese;studio;attività;wbs;importo;stanziamento/storno;metodologia;note)
        </p>
        
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <input 
              type="file" 
              accept=".csv" 
              onChange={handleFileUpload} 
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              ref={fileInputRef}
            />
          </div>
          
          <button
            onClick={loadDemoData}
            className="py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Carica dati di esempio
          </button>
          
          {fileLoaded && (
            <button
              onClick={resetData}
              className="py-2 px-4 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Reset
            </button>
          )}
        </div>
        
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
      </div>
      
      {!fileLoaded ? (
        <div className="text-center p-8 bg-gray-50 rounded">
          <p className="text-lg text-gray-600">
            Carica un file CSV per visualizzare il report contabile
          </p>
        </div>
      ) : (
        <>
          {/* Filtri per Studio e Anno-Mese */}
          <div className="mb-6 flex flex-wrap gap-4 items-center">
            <div>
              <label className="mr-2 font-medium">Filtra per Studio:</label>
              <select 
                value={selectedStudio} 
                onChange={(e) => setSelectedStudio(e.target.value)}
                className="p-2 border rounded bg-white"
              >
                {studi.map(studio => (
                  <option key={studio} value={studio}>{studio}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="mr-2 font-medium">Filtra per Anno-Mese:</label>
              <select 
                value={selectedAnnoMese} 
                onChange={(e) => setSelectedAnnoMese(e.target.value)}
                className="p-2 border rounded bg-white"
              >
                {annoMeseOptions.map(annoMese => (
                  <option key={annoMese} value={annoMese}>{annoMese}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Grafici */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">
              Riepilogo Stanziamenti e Storni
              {selectedAnnoMese !== 'Tutti' && ` - ${selectedAnnoMese}`}
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={getFilteredChartData()}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Stanziamenti" fill="#8884d8" />
                  <Bar dataKey="Storni" fill="#82ca9d" />
                  <Bar dataKey="Saldo" fill="#ff7300" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Tabella Categorie Aperte */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">
              Categorie Aperte (con stanziamenti da stornare)
              {selectedAnnoMese !== 'Tutti' && ` - ${selectedAnnoMese}`}
            </h2>
            {getFilteredCategorieAperte().length === 0 ? (
              <p className="text-green-600 font-medium">
                Non ci sono categorie aperte per il periodo selezionato. 
                {selectedAnnoMese !== 'Tutti' 
                  ? ` Nel periodo ${selectedAnnoMese} tutti gli stanziamenti sono stati stornati correttamente.`
                  : ' Tutti gli stanziamenti sono stati stornati correttamente.'
                }
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2 border">Studio</th>
                      <th className="p-2 border">Categoria</th>
                      <th className="p-2 border">Stanziamenti</th>
                      <th className="p-2 border">Storni</th>
                      <th className="p-2 border">Saldo da Stornare</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredCategorieAperte().map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="p-2 border">{item.Studio}</td>
                        <td className="p-2 border">{item.Categoria}</td>
                        <td className="p-2 border text-right">{item.TotaleStanziamenti.toFixed(2).replace('.', ',')}</td>
                        <td className="p-2 border text-right">{item.TotaleStorni.toFixed(2).replace('.', ',')}</td>
                        <td className="p-2 border text-right font-medium text-red-600">{item.Saldo.toFixed(2).replace('.', ',')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          {/* Tabella Riepilogo Completo */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">
              Riepilogo Completo
              {selectedAnnoMese !== 'Tutti' && ` - ${selectedAnnoMese}`}
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 border">Studio</th>
                    <th className="p-2 border">Categoria</th>
                    <th className="p-2 border">Stanziamenti</th>
                    <th className="p-2 border">Storni</th>
                    <th className="p-2 border">Saldo</th>
                    <th className="p-2 border">Stato</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredData().map((item, index) => (
                    <tr key={index} className={item.Saldo === 0 ? "bg-green-50 hover:bg-green-100" : "hover:bg-gray-50"}>
                      <td className="p-2 border">{item.Studio}</td>
                      <td className="p-2 border">{item.Categoria}</td>
                      <td className="p-2 border text-right">{item.TotaleStanziamenti.toFixed(2).replace('.', ',')}</td>
                      <td className="p-2 border text-right">{item.TotaleStorni.toFixed(2).replace('.', ',')}</td>
                      <td className="p-2 border text-right">{item.Saldo.toFixed(2).replace('.', ',')}</td>
                      <td className="p-2 border">
                        {item.Saldo === 0 ? (
                          <span className="text-green-600 font-medium">Bilanciato</span>
                        ) : item.Saldo > 0 ? (
                          <span className="text-red-600 font-medium">Da stornare: {item.Saldo.toFixed(2).replace('.', ',')}</span>
                        ) : (
                          <span className="text-red-600 font-medium">Errore: Stornato in eccesso {Math.abs(item.Saldo).toFixed(2).replace('.', ',')}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Dettaglio Movimenti */}
          <div>
            <h2 className="text-xl font-semibold mb-4">
              Dettaglio Movimenti
              {selectedAnnoMese !== 'Tutti' && ` - ${selectedAnnoMese}`}
            </h2>
            {getFilteredData().map((item, index) => (
              <div key={index} className="mb-6 p-4 border rounded">
                <h3 className="text-lg font-medium mb-2">{item.Studio} - {item.Categoria}</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="p-2 border">Data</th>
                        <th className="p-2 border">Stanziamenti</th>
                        <th className="p-2 border">Storni</th>
                      </tr>
                    </thead>
                    <tbody>
                      {item.Movimenti.map((mov, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="p-2 border">{mov.Data}</td>
                          <td className="p-2 border text-right">{mov.Stanziamenti ? mov.Stanziamenti.toFixed(2).replace('.', ',') : ''}</td>
                          <td className="p-2 border text-right">{mov.Storni ? mov.Storni.toFixed(2).replace('.', ',') : ''}</td>
                        </tr>
                      ))}
                      <tr className="bg-gray-100 font-medium">
                        <td className="p-2 border">Totale</td>
                        <td className="p-2 border text-right">{item.TotaleStanziamenti.toFixed(2).replace('.', ',')}</td>
                        <td className="p-2 border text-right">{item.TotaleStorni.toFixed(2).replace('.', ',')}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      
      <div className="mt-8 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} Sistema di Verifica e Reporting Contabile</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <div className="App">
      <ContabilitaReport />
    </div>
  );
}
