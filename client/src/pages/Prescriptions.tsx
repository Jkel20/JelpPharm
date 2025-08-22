import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Download,
  Save
} from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { generateReport, downloadPDF, ReportData } from '../utils/pdfGenerator';

interface Patient {
  id: string;
  name: string;
  phone: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  address: string;
  medicalHistory: string;
}

interface PrescriptionItem {
  drugId: string;
  drugName: string;
  strength: string;
  dosageForm: string;
  quantity: number;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  prescriptionRequired: boolean;
}

interface Prescription {
  id: string;
  patientId: string;
  patient: Patient;
  items: PrescriptionItem[];
  diagnosis: string;
  prescribedBy: string;
  prescribedDate: string;
  expiryDate: string;
  status: 'active' | 'completed' | 'cancelled' | 'expired';
  notes: string;
  totalCost: number;
  isDispensed: boolean;
  dispensedDate?: string;
  dispensedBy?: string;
}

interface Drug {
  id: string;
  name: string;
  strength: string;
  dosageForm: string;
  unitPrice: number;
  prescriptionRequired: boolean;
}

export const Prescriptions: React.FC = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showNewPrescription, setShowNewPrescription] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [showViewPrescription, setShowViewPrescription] = useState(false);
  const [showEditPrescription, setShowEditPrescription] = useState(false);

  // Mock data - replace with API calls
  useEffect(() => {
    const mockPatients: Patient[] = [
      {
        id: '1',
        name: 'John Doe',
        phone: '+233 24 123 4567',
        age: 35,
        gender: 'male',
        address: '123 Main Street, Accra',
        medicalHistory: 'Hypertension, Diabetes Type 2'
      },
      {
        id: '2',
        name: 'Sarah Johnson',
        phone: '+233 20 987 6543',
        age: 28,
        gender: 'female',
        address: '456 Oak Avenue, Kumasi',
        medicalHistory: 'Asthma, Seasonal allergies'
      },
      {
        id: '3',
        name: 'Michael Brown',
        phone: '+233 26 555 1234',
        age: 45,
        gender: 'male',
        address: '789 Pine Road, Tamale',
        medicalHistory: 'None'
      }
    ];

    const mockDrugs: Drug[] = [
      {
        id: '1',
        name: 'Paracetamol',
        strength: '500mg',
        dosageForm: 'Tablet',
        unitPrice: 2.50,
        prescriptionRequired: false
      },
      {
        id: '2',
        name: 'Amoxicillin',
        strength: '500mg',
        dosageForm: 'Capsule',
        unitPrice: 8.50,
        prescriptionRequired: true
      },
      {
        id: '3',
        name: 'Artemether-Lumefantrine',
        strength: '20mg/120mg',
        dosageForm: 'Tablet',
        unitPrice: 25.00,
        prescriptionRequired: true
      }
    ];

    const mockPrescriptions: Prescription[] = [
      {
        id: '1',
        patientId: '1',
        patient: mockPatients[0],
        items: [
          {
            drugId: '1',
            drugName: 'Paracetamol',
            strength: '500mg',
            dosageForm: 'Tablet',
            quantity: 20,
            dosage: '1 tablet',
            frequency: 'Every 6 hours',
            duration: '5 days',
            instructions: 'Take with food',
            prescriptionRequired: false
          }
        ],
        diagnosis: 'Fever and headache',
        prescribedBy: 'Dr. Kwame Asante',
        prescribedDate: '2024-01-15',
        expiryDate: '2024-02-15',
        status: 'active',
        notes: 'Patient has history of sensitivity to NSAIDs',
        totalCost: 50.00,
        isDispensed: false
      },
      {
        id: '2',
        patientId: '2',
        patient: mockPatients[1],
        items: [
          {
            drugId: '2',
            drugName: 'Amoxicillin',
            strength: '500mg',
            dosageForm: 'Capsule',
            quantity: 14,
            dosage: '1 capsule',
            frequency: 'Twice daily',
            duration: '7 days',
            instructions: 'Take on empty stomach',
            prescriptionRequired: true
          }
        ],
        diagnosis: 'Upper respiratory tract infection',
        prescribedBy: 'Dr. Ama Osei',
        prescribedDate: '2024-01-14',
        expiryDate: '2024-02-14',
        status: 'active',
        notes: 'Complete full course',
        totalCost: 119.00,
        isDispensed: true,
        dispensedDate: '2024-01-14',
        dispensedBy: 'Pharm. Kofi Mensah'
      }
    ];

    setPatients(mockPatients);
    setDrugs(mockDrugs);
    setPrescriptions(mockPrescriptions);
    setIsLoading(false);
  }, []);

  const handleExportPrescriptions = () => {
    const reportData: ReportData = {
      title: 'Prescriptions Report',
      period: new Date().toLocaleDateString(),
      generatedDate: new Date().toLocaleDateString(),
      data: prescriptions.map(prescription => ({
        'Prescription ID': prescription.id,
        'Patient Name': prescription.patient.name,
        'Patient Phone': prescription.patient.phone,
        'Diagnosis': prescription.diagnosis,
        'Prescribed By': prescription.prescribedBy,
        'Status': prescription.status,
        'Total Cost': `₵${prescription.totalCost.toFixed(2)}`,
        'Is Dispensed': prescription.isDispensed ? 'Yes' : 'No',
        'Prescribed Date': prescription.prescribedDate
      })),
      summary: {
        totalSales: prescriptions.length,
        totalRevenue: prescriptions.reduce((sum, p) => sum + p.totalCost, 0)
      }
    };

    const doc = generateReport(reportData);
    downloadPDF(doc, `prescriptions-report-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleViewPrescription = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setShowViewPrescription(true);
  };

  const handleEditPrescription = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setShowEditPrescription(true);
  };

  const handleDeletePrescription = (prescriptionId: string) => {
    if (window.confirm('Are you sure you want to delete this prescription?')) {
      setPrescriptions(prescriptions.filter(p => p.id !== prescriptionId));
    }
  };

  const handleSavePrescription = (prescriptionData: Partial<Prescription>) => {
    // Here you would typically save to your backend
    const newPrescription: Prescription = {
      id: Date.now().toString(),
      patientId: prescriptionData.patientId || '',
      patient: patients.find(p => p.id === prescriptionData.patientId) || patients[0],
      items: prescriptionData.items || [],
      diagnosis: prescriptionData.diagnosis || '',
      prescribedBy: prescriptionData.prescribedBy || 'Dr. Current User',
      prescribedDate: new Date().toISOString().split('T')[0],
      expiryDate: prescriptionData.expiryDate || '',
      status: 'active',
      notes: prescriptionData.notes || '',
      totalCost: (prescriptionData.items || []).reduce((sum, item) => sum + (item.quantity * (drugs.find(d => d.id === item.drugId)?.unitPrice || 0)), 0),
      isDispensed: false
    };

    setPrescriptions([...prescriptions, newPrescription]);
    setShowNewPrescription(false);
  };

  const filteredPrescriptions = prescriptions.filter(prescription => {
    const matchesSearch = prescription.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prescription.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prescription.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || prescription.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading prescriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-400/20 to-blue-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-green-300/10 to-blue-300/10 rounded-full blur-3xl"></div>
      </div>
      {/* Header */}
      <div className="relative bg-white/80 backdrop-blur-sm shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Prescriptions</h1>
              <p className="text-gray-600">Manage patient prescriptions and medication orders</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                className="flex items-center bg-white/80 hover:bg-white backdrop-blur-sm border-gray-300 hover:border-gray-400"
                onClick={handleExportPrescriptions}
              >
                <Download className="w-4 h-4 mr-2" />
                Export Prescriptions
              </Button>
              <Button 
                className="flex items-center bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                onClick={() => setShowNewPrescription(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Prescription
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-64">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                      placeholder="Search prescriptions by patient name, diagnosis, or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                  />
                </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Prescriptions Table */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 border-b border-green-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-green-800">All Prescriptions</h3>
              <span className="text-sm text-green-600">
                {filteredPrescriptions.length} prescriptions found
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prescription Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status & Cost
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPrescriptions.map((prescription) => (
                    <tr key={prescription.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{prescription.patient.name}</div>
                            <div className="text-sm text-gray-500">{prescription.patient.phone}</div>
                          <div className="text-xs text-gray-400">Age: {prescription.patient.age} • {prescription.patient.gender}</div>
                          </div>
                        </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          <div className="font-medium">{prescription.diagnosis}</div>
                          <div className="text-gray-500">{prescription.items.length} items</div>
                          <div className="text-xs text-gray-400">By: {prescription.prescribedBy}</div>
                          <div className="text-xs text-gray-400">Date: {prescription.prescribedDate}</div>
                          </div>
                        </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            prescription.status === 'active' ? 'bg-green-100 text-green-800' :
                            prescription.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                            prescription.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                              {prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}
                            </span>
                          </div>
                        <div className="text-sm text-gray-900 mt-1">
                          Total: ₵{prescription.totalCost.toFixed(2)}
                            </div>
                        <div className="text-xs text-gray-500">
                          {prescription.isDispensed ? 'Dispensed' : 'Not Dispensed'}
                          </div>
                        </td>
                      <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewPrescription(prescription)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                              <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditPrescription(prescription)}
                            className="text-green-600 hover:text-green-700"
                          >
                                <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeletePrescription(prescription.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                              <Trash2 className="w-4 h-4" />
                          </Button>
                          </div>
                        </td>
                      </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New Prescription Modal */}
      <Modal
        isOpen={showNewPrescription}
        onClose={() => setShowNewPrescription(false)}
        title="New Prescription"
        size="xl"
      >
        <NewPrescriptionForm
          patients={patients}
          drugs={drugs}
          onSave={handleSavePrescription}
          onCancel={() => setShowNewPrescription(false)}
        />
      </Modal>

      {/* View Prescription Modal */}
      <Modal
        isOpen={showViewPrescription}
        onClose={() => setShowViewPrescription(false)}
        title="Prescription Details"
        size="lg"
      >
        {selectedPrescription && (
          <ViewPrescription prescription={selectedPrescription} />
        )}
      </Modal>

      {/* Edit Prescription Modal */}
      <Modal
        isOpen={showEditPrescription}
        onClose={() => setShowEditPrescription(false)}
        title="Edit Prescription"
        size="xl"
      >
        {selectedPrescription && (
          <EditPrescriptionForm
            prescription={selectedPrescription}
            patients={patients}
            drugs={drugs}
            onSave={(updatedPrescription) => {
              setPrescriptions(prescriptions.map(p => 
                p.id === updatedPrescription.id ? updatedPrescription : p
              ));
              setShowEditPrescription(false);
            }}
            onCancel={() => setShowEditPrescription(false)}
          />
        )}
      </Modal>
    </div>
  );
};

// New Prescription Form Component
interface NewPrescriptionFormProps {
  patients: Patient[];
  drugs: Drug[];
  onSave: (prescription: Partial<Prescription>) => void;
  onCancel: () => void;
}

const NewPrescriptionForm: React.FC<NewPrescriptionFormProps> = ({ patients, drugs, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    patientId: '',
    diagnosis: '',
    notes: '',
    expiryDate: '',
    items: [] as PrescriptionItem[]
  });

  const [currentItem, setCurrentItem] = useState<Partial<PrescriptionItem>>({
    drugId: '',
    quantity: 1,
    dosage: '',
    frequency: '',
    duration: '',
    instructions: ''
  });

  const addItem = () => {
    if (currentItem.drugId && currentItem.dosage && currentItem.frequency && currentItem.duration) {
      const drug = drugs.find(d => d.id === currentItem.drugId);
      if (drug) {
        const newItem: PrescriptionItem = {
          ...currentItem as PrescriptionItem,
          drugName: drug.name,
          strength: drug.strength,
          dosageForm: drug.dosageForm,
          prescriptionRequired: drug.prescriptionRequired
        };
        setFormData({
          ...formData,
          items: [...formData.items, newItem]
        });
        setCurrentItem({
          drugId: '',
          quantity: 1,
          dosage: '',
          frequency: '',
          duration: '',
          instructions: ''
        });
      }
    }
  };

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.patientId && formData.diagnosis && formData.items.length > 0) {
      onSave(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Patient</label>
          <select
            value={formData.patientId}
            onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            required
          >
            <option value="">Select Patient</option>
            {patients.map(patient => (
              <option key={patient.id} value={patient.id}>
                {patient.name} - {patient.phone}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
          <Input
            type="date"
            value={formData.expiryDate}
            onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
            required
          />
              </div>
            </div>
            
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Diagnosis</label>
        <Input
          type="text"
          value={formData.diagnosis}
          onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
          placeholder="Enter diagnosis"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="w-full border border-gray-300 rounded-md px-3 py-2"
          rows={3}
          placeholder="Additional notes..."
        />
      </div>

      {/* Add Medication Items */}
      <div className="border-t pt-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Medication Items</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Drug</label>
            <select
              value={currentItem.drugId}
              onChange={(e) => setCurrentItem({ ...currentItem, drugId: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">Select Drug</option>
              {drugs.map(drug => (
                <option key={drug.id} value={drug.id}>
                  {drug.name} - {drug.strength} {drug.dosageForm}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
            <Input
              type="number"
              value={currentItem.quantity}
              onChange={(e) => setCurrentItem({ ...currentItem, quantity: parseInt(e.target.value) })}
              min="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Dosage</label>
            <Input
              type="text"
              value={currentItem.dosage}
              onChange={(e) => setCurrentItem({ ...currentItem, dosage: e.target.value })}
              placeholder="e.g., 1 tablet"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
            <Input
              type="text"
              value={currentItem.frequency}
              onChange={(e) => setCurrentItem({ ...currentItem, frequency: e.target.value })}
              placeholder="e.g., Twice daily"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
            <Input
              type="text"
              value={currentItem.duration}
              onChange={(e) => setCurrentItem({ ...currentItem, duration: e.target.value })}
              placeholder="e.g., 7 days"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Instructions</label>
            <Input
              type="text"
              value={currentItem.instructions}
              onChange={(e) => setCurrentItem({ ...currentItem, instructions: e.target.value })}
              placeholder="e.g., Take with food"
            />
          </div>
              </div>
              
        <Button
          type="button"
          onClick={addItem}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>

        {/* Display added items */}
        {formData.items.length > 0 && (
          <div className="mt-4 space-y-2">
            {formData.items.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div>
                  <span className="font-medium">{item.drugName}</span>
                  <span className="text-gray-500 ml-2">
                    {item.quantity}x {item.dosage} {item.frequency} for {item.duration}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeItem(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <Button variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
        <Button type="submit" className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
          <Save className="w-4 h-4 mr-2" />
                  Save Prescription
                </Button>
              </div>
    </form>
  );
};

// View Prescription Component
interface ViewPrescriptionProps {
  prescription: Prescription;
}

const ViewPrescription: React.FC<ViewPrescriptionProps> = ({ prescription }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Patient Name</label>
          <p className="text-gray-900">{prescription.patient.name}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Phone</label>
          <p className="text-gray-900">{prescription.patient.phone}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Diagnosis</label>
          <p className="text-gray-900">{prescription.diagnosis}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <p className="text-gray-900">{prescription.status}</p>
            </div>
          </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Medication Items</label>
        <div className="space-y-2">
          {prescription.items.map((item, index) => (
            <div key={index} className="p-3 bg-gray-50 rounded-md">
              <div className="font-medium">{item.drugName}</div>
              <div className="text-sm text-gray-600">
                {item.quantity}x {item.dosage} {item.frequency} for {item.duration}
        </div>
              {item.instructions && (
                <div className="text-sm text-gray-500">Instructions: {item.instructions}</div>
      )}
    </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-200">
        <Button onClick={() => window.close()}>
          Close
        </Button>
      </div>
    </div>
  );
};

// Edit Prescription Form Component
interface EditPrescriptionFormProps {
  prescription: Prescription;
  patients: Patient[];
  drugs: Drug[];
  onSave: (prescription: Prescription) => void;
  onCancel: () => void;
}

const EditPrescriptionForm: React.FC<EditPrescriptionFormProps> = ({ prescription, patients, drugs, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    patientId: prescription.patientId,
    diagnosis: prescription.diagnosis,
    notes: prescription.notes,
    expiryDate: prescription.expiryDate,
    items: prescription.items
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedPrescription: Prescription = {
      ...prescription,
      ...formData,
      patient: patients.find(p => p.id === formData.patientId) || prescription.patient,
      totalCost: formData.items.reduce((sum, item) => sum + (item.quantity * (drugs.find(d => d.id === item.drugId)?.unitPrice || 0)), 0)
    };
    onSave(updatedPrescription);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Patient</label>
          <select
            value={formData.patientId}
            onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            required
          >
            {patients.map(patient => (
              <option key={patient.id} value={patient.id}>
                {patient.name} - {patient.phone}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
          <Input
            type="date"
            value={formData.expiryDate}
            onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Diagnosis</label>
        <Input
          type="text"
          value={formData.diagnosis}
          onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="w-full border border-gray-300 rounded-md px-3 py-2"
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
          <Save className="w-4 h-4 mr-2" />
          Update Prescription
        </Button>
      </div>
    </form>
  );
};
