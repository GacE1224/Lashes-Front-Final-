import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// 1. IMPORTAMOS AXIOS (Asegúrate de que la ruta sea correcta)
// Si este archivo está en la misma carpeta que Citas.jsx, usa '../../'
import { apiLashes } from '../../servicios/axios'; 

const ImprimirComprobante = () => {
  const { id: citaId } = useParams();
  
  const [cita, setCita] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const comprobanteRef = useRef(null);

  // 2. CORRECCIÓN: Usamos apiLashes en lugar de fetch
  useEffect(() => {
    const fetchCita = async () => {
      try {
        setIsLoading(true);
        
        // Usamos .get. Axios ya sabe que la base es la URL de Render.
        // Solo ponemos '/citas/${citaId}'
        const { data } = await apiLashes.get(`/citas/${citaId}`);
        
        setCita(data);
        setError(null);

      } catch (err) {
        console.error("Error obteniendo cita:", err);
        setError('No se pudo encontrar la información de la cita.');
        setCita(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (citaId) {
        fetchCita();
    }
  }, [citaId]);

  const handleDownloadPDF = () => {
    const input = comprobanteRef.current;
    
    // Captura con mejor escala para que no se vea borroso
    html2canvas(input, { 
        scale: 2,
        useCORS: true // Importante por si hay imágenes externas
    }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight(); // Variable no usada pero útil saberla
      
      const imgProps = pdf.getImageProperties(imgData);
      const margin = 10;
      const imgWidth = pdfWidth - (margin * 2);
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', margin, 20, imgWidth, imgHeight);
      pdf.save(`Comprobante_Lashista_${citaId}.pdf`);
    });
  };

  const formatFecha = (isoString) => {
    if(!isoString) return '';
    // Aseguramos compatibilidad creando el objeto Date correctamente
    const date = new Date(isoString);
    return date.toLocaleDateString('es-MX', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  };

  const formatHora = (isoString) => {
    if(!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString('es-MX', {
      hour: '2-digit', minute: '2-digit', hour12: true,
    });
  };

  if (isLoading) return <div>Cargando comprobante...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!cita) return <div>No se encontraron datos.</div>;

  return (
    <div className="comprobante-page">
      <div className="comprobante-container">
        
        {/* === TICKET A IMPRIMIR === */}
        <div className="comprobante-ticket" ref={comprobanteRef}>
          <div className="ticket-header">
            <h2>Studio Lashista</h2>
            <h3>Comprobante de Cita</h3>
            <p>¡Gracias por tu preferencia!</p>
          </div>
          <div className="ticket-details">
            <dl>
              <dt>Cliente:</dt>
              <dd>{cita.nombre_usuario}</dd>
              
              <dt>Servicio:</dt>
              <dd>{cita.productos}</dd>
              
              <dt>Fecha:</dt>
              <dd>{formatFecha(cita.hora_dia)}</dd>
              
              <dt>Hora:</dt>
              <dd>{formatHora(cita.hora_dia)}</dd>
              
              <dt>Costo Total:</dt>
              <dd className="costo-total">$ {cita.costo.toFixed(2)} MXN</dd>

              <dt>ID de Cita:</dt>
              <dd className="cita-id">{cita._id}</dd>
            </dl>
          </div>
          <div className="ticket-footer">
            <p>Por favor presenta este comprobante al llegar.</p>
          </div>
        </div>

        {/* === BOTONES DE ACCIÓN === */}
        <div className="comprobante-actions">
          <button onClick={handleDownloadPDF} className="btn-download">
            Descargar Comprobante (PDF)
          </button>
          
          <Link to="/" className="btn-home">
            Volver al inicio
          </Link>
        </div>

      </div>
      
      {/* Estilos CSS Inline */}
      <style>{`
        .comprobante-page { display: flex; justify-content: center; padding: 40px; background: #f4f4f9; min-height: 100vh; }
        .comprobante-container { background: white; max-width: 400px; width: 100%; border-radius: 10px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); overflow: hidden; }
        .comprobante-ticket { padding: 30px; background: #fff; }
        .ticket-header { text-align: center; border-bottom: 2px dashed #e8a0bf; padding-bottom: 20px; margin-bottom: 20px; }
        .ticket-header h2 { color: #d17a9e; margin: 0; }
        .ticket-details dt { font-weight: bold; color: #555; margin-top: 10px; font-size: 0.9rem; }
        .ticket-details dd { margin: 0; padding-bottom: 5px; border-bottom: 1px solid #eee; color: #333; }
        .costo-total { color: #d17a9e !important; font-size: 1.4rem !important; font-weight: bold; text-align: right; margin-top: 10px !important; border: none !important; }
        .cita-id { font-size: 0.75rem !important; color: #aaa !important; }
        .ticket-footer { text-align: center; margin-top: 20px; padding-top: 20px; border-top: 2px dashed #e8a0bf; font-size: 0.8rem; color: #777; }
        .comprobante-actions { padding: 20px; display: flex; flex-direction: column; gap: 10px; background: #f9f9f9; }
        .btn-download { background: #d17a9e; color: white; border: none; padding: 12px; border-radius: 5px; cursor: pointer; font-weight: bold; font-size: 1rem; }
        .btn-download:hover { background: #c0628b; }
        .btn-home { text-align: center; color: #d17a9e; text-decoration: none; padding: 10px; border: 1px solid #d17a9e; border-radius: 5px; }
      `}</style>
    </div>
  );
};

export default ImprimirComprobante;