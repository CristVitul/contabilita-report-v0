import { useState } from 'react';
import './DataUploader.css';

export default function DataUploader() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [studioFilter, setStudioFilter] = useState('tutti');
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };
  
  const handleLoadSampleData = () => {
    // Simulazione del caricamento dati di esempio
    console.log("Caricamento dati di esempio");
  };
  
  const handleReset = () => {
    setSelectedFile(null);
    // Reset altri stati se necessario
  };
  
  const handleFilterChange = (e) => {
    setStudioFilter(e.target.value);
  };
  
  return (
    <div className="w-full bg-gray-50 p-6 rounded-lg shadow-sm">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-center mb-6">Carica i tuoi dati</h1>
        
        <div className="text-center mb-4">
          <p className="text-gray-700">
            Carica un file CSV con formato: Date;Studio;Stanziamenti;Storni;Categoria
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
          <label className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 cursor-pointer">
            <Upload size={16} />
            <span>Scegli file</span>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
          
          <div className="text-sm text-gray-500">
            {selectedFile ? selectedFile.name : 'Nessun file selezionato'}
          </div>
        </div>
        
        <div className="flex justify-center gap-3">
          <button 
            onClick={handleLoadSampleData}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <FileText size={16} />
            Carica dati di esempio
          </button>
          
          <button 
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            <RefreshCw size={16} />
            Reset
          </button>
        </div>
      </div>
      
      <div className="flex items-center justify-center gap-4 mb-6">
        <label htmlFor="studioFilter" className="font-medium text-gray-700">
          Filtra per Studio:
        </label>
        <select
          id="studioFilter"
          value={studioFilter}
          onChange={handleFilterChange}
          className="bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3"
        >
          <option value="tutti">Tutti</option>
          <option value="apple">Apple</option>
          <option value="pear">Pear</option>
        </select>
      </div>
      
      <div>
        <h2 className="text-xl font-bold text-center mb-4">Riepilogo Stanziamenti e Storni</h2>
        {/* Il grafico verrà inserito qui */}
        <div className="h-64 bg-gray-100 rounded-md flex items-center justify-center text-gray-500">
          Area grafico
        </div>
      </div>
    </div>
  );
}