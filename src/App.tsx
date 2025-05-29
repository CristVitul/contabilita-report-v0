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
    console.log("Caricamento dati di esempio");
  };
  
  const handleReset = () => {
    setSelectedFile(null);
  };
  
  const handleFilterChange = (e) => {
    setStudioFilter(e.target.value);
  };
  
  return (
    <div 
      className="uploader-container custom-uploader" 
      data-testid="uploader-container"
      style={{border: '3px solid green'}} // Stile inline per test
    >
      <h1 className="uploader-title" style={{color: 'purple'}}>Carica i tuoi dati</h1>
      
      <p className="description">
        Carica un file CSV sia nel vecchio formato (Date;Studio;Stanziamenti;Storni;Categoria) o nel nuovo formato
        (anno;mese;studio;attività;wbs;importo;stanziamento/storno;metodologia;note)
      </p>
      
      <div className="upload-section">
        <label className="file-button">
          Scegli file
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden-input"
          />
        </label>
        
        <div className="file-info">
          {selectedFile ? selectedFile.name : 'Nessun file selezionato'}
        </div>
      </div>
      
      <div className="buttons-container">
        <button 
          onClick={handleLoadSampleData}
          className="primary-button"
          style={{backgroundColor: 'red'}} // Stile inline per test
        >
          Carica dati di esempio
        </button>
        
        <button 
          onClick={handleReset}
          className="secondary-button"
        >
          Reset
        </button>
      </div>
      
      <div className="filter-section">
        <label htmlFor="studioFilter" className="filter-label">
          Filtra per Studio:
        </label>
        <select
          id="studioFilter"
          value={studioFilter}
          onChange={handleFilterChange}
          className="select-input"
        >
          <option value="tutti">Tutti</option>
          <option value="apple">Apple</option>
          <option value="pear">Pear</option>
        </select>
      </div>
      
      <h2 className="chart-title">Riepilogo Stanziamenti e Storni</h2>
      <div className="chart-placeholder">
        Area grafico
      </div>
    </div>
  );
}
