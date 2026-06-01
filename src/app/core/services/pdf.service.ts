import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Appointment } from '../models/appointment.model';

@Injectable({ providedIn: 'root' })
export class PdfService {

  exportAppointments(appointments: Appointment[], dateTitle: string) {
    const doc = new jsPDF();
    doc.text(`Reporte de Citas - ${dateTitle}`, 14, 20);
    
    const tableData = appointments.map(app => [
      app.time,
      app.clientName,
      app.barberName,
      app.service,
      `$${app.payment.amount}`,
      app.status
    ]);

    const total = appointments.reduce((sum, app) => sum + app.payment.amount, 0);

    autoTable(doc, {
      startY: 30,
      head: [['Hora', 'Cliente', 'Barbero', 'Servicio', 'Monto', 'Estado']],
      body: tableData,
    });

    const finalY = (doc as any).lastAutoTable.finalY || 30;
    doc.text(`Total Ingresos: $${total}`, 14, finalY + 10);
    
    doc.save(`Reporte_Citas_${new Date().getTime()}.pdf`);
  }
}
