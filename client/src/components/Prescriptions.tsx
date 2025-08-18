import React, { useState, useEffect } from 'react';
import {
  Box, Button, Card, CardContent, Container, Dialog, DialogActions,
  DialogContent, DialogTitle, FormControl, Grid, IconButton, InputLabel,
  MenuItem, Paper, Select, Table, TableBody, TableCell, TableContainer,
  TableHead, TablePagination, TableRow, TextField, Typography, Chip,
  Alert, Snackbar, Tooltip, Fab, TextareaAutosize
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  Visibility as ViewIcon, Download as DownloadIcon, Search as SearchIcon
} from '@mui/icons-material';

interface Prescription {
  _id: string;
  patient: { name: string; phone: string; email?: string; dateOfBirth: string; gender: string };
  doctor: { name: string; phone: string; email?: string; specialization: string };
  drugs: Array<{
    drug: { name: string; genericName: string; strength: string; form: string };
    dosage: string;
    frequency: string;
    duration: string;
    quantity: number;
    instructions: string;
  }>;
  diagnosis: string;
  instructions: string;
  prescribedDate: string;
  expiryDate: string;
  refills: number;
  status: string;
  store: { name: string; location: string };
  createdAt: string;
}

const Prescriptions: React.FC = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<Prescription | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });

  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    storeId: '',
    diagnosis: '',
    instructions: '',
    prescribedDate: '',
    expiryDate: '',
    refills: '0',
    drugs: [{ drugId: '', dosage: '', frequency: '', duration: '', quantity: '1', instructions: '' }]
  });

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const response = await fetch('/api/prescriptions');
      const data = await response.json();
      if (data.success) setPrescriptions(data.data);
    } catch (error) {
      showSnackbar('Error fetching prescriptions', 'error');
    }
  };

  const handleAddPrescription = async () => {
    try {
      const response = await fetch('/api/prescriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        showSnackbar('Prescription created successfully', 'success');
        setOpenDialog(false);
        fetchPrescriptions();
      }
    } catch (error) {
      showSnackbar('Error creating prescription', 'error');
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await fetch('/api/prescriptions/export/csv', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'prescriptions-export.csv';
        a.click();
        showSnackbar('Prescriptions exported successfully', 'success');
      }
    } catch (error) {
      showSnackbar('Error exporting prescriptions', 'error');
    }
  };

  const addDrugToPrescription = () => {
    setFormData({
      ...formData,
      drugs: [...formData.drugs, { drugId: '', dosage: '', frequency: '', duration: '', quantity: '1', instructions: '' }]
    });
  };

  const removeDrugFromPrescription = (index: number) => {
    const newDrugs = formData.drugs.filter((_, i) => i !== index);
    setFormData({ ...formData, drugs: newDrugs });
  };

  const updateDrugInPrescription = (index: number, field: string, value: string) => {
    const newDrugs = [...formData.drugs];
    newDrugs[index] = { ...newDrugs[index], [field]: value };
    setFormData({ ...formData, drugs: newDrugs });
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const filteredPrescriptions = prescriptions.filter(prescription =>
    prescription.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prescription.doctor.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'completed': return 'primary';
      case 'expired': return 'warning';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="xl">
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <CardContent>
          <Typography variant="h4">Prescriptions Management</Typography>
          <Typography variant="subtitle1">Manage patient prescriptions, track dispensing, and monitor expiry dates</Typography>
        </CardContent>
      </Card>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 3 }}>
        <Card>
          <CardContent>
            <Typography color="textSecondary">Total Prescriptions</Typography>
            <Typography variant="h4">{prescriptions.length}</Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography color="textSecondary">Active Prescriptions</Typography>
            <Typography variant="h4" color="success.main">
              {prescriptions.filter(p => p.status === 'active').length}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography color="textSecondary">Expired</Typography>
            <Typography variant="h4" color="warning.main">
              {prescriptions.filter(p => p.status === 'expired').length}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography color="textSecondary">Completed</Typography>
            <Typography variant="h4" color="primary.main">
              {prescriptions.filter(p => p.status === 'completed').length}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2, alignItems: 'center' }}>
          <TextField
            fullWidth
            label="Search"
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          />
          <Button
            fullWidth
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExportCSV}
          >
            Export
          </Button>
          <Button
            fullWidth
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
          >
            New Prescription
          </Button>
        </Box>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Patient</TableCell>
              <TableCell>Doctor</TableCell>
              <TableCell>Drugs</TableCell>
              <TableCell>Diagnosis</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Expiry Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPrescriptions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((prescription) => (
              <TableRow key={prescription._id}>
                <TableCell>
                  <Typography variant="subtitle2">{prescription.patient.name}</Typography>
                  <Typography variant="caption" color="textSecondary">
                    {prescription.patient.phone}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2">{prescription.doctor.name}</Typography>
                  <Typography variant="caption" color="textSecondary">
                    {prescription.doctor.specialization}
                  </Typography>
                </TableCell>
                <TableCell>
                  {prescription.drugs.map((drug, index) => (
                    <Typography key={index} variant="caption" display="block">
                      {drug.drug.name} - {drug.dosage}
                    </Typography>
                  ))}
                </TableCell>
                <TableCell>
                  <Typography variant="body2" noWrap>
                    {prescription.diagnosis}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={prescription.status}
                    color={getStatusColor(prescription.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(prescription.expiryDate).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => setEditingItem(prescription)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small" color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredPrescriptions.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>New Prescription</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
              <TextField
                fullWidth
                label="Patient ID"
                value={formData.patientId}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, patientId: e.target.value })}
              />
              <TextField
                fullWidth
                label="Doctor ID"
                value={formData.doctorId}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, doctorId: e.target.value })}
              />
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
              <TextField
                fullWidth
                label="Store ID"
                value={formData.storeId}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, storeId: e.target.value })}
              />
              <TextField
                fullWidth
                label="Refills"
                type="number"
                value={formData.refills}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, refills: e.target.value })}
              />
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
              <TextField
                fullWidth
                label="Prescribed Date"
                type="date"
                value={formData.prescribedDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, prescribedDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                label="Expiry Date"
                type="date"
                value={formData.expiryDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, expiryDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            <TextField
              fullWidth
              label="Diagnosis"
              value={formData.diagnosis}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, diagnosis: e.target.value })}
            />
            <TextField
              fullWidth
              label="Instructions"
              multiline
              rows={3}
              value={formData.instructions}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, instructions: e.target.value })}
            />

            <Box>
              <Typography variant="h6" gutterBottom>
                Drugs
                <Button
                  size="small"
                  onClick={addDrugToPrescription}
                  sx={{ ml: 2 }}
                >
                  Add Drug
                </Button>
              </Typography>
              {formData.drugs.map((drug, index) => (
                <Paper key={index} sx={{ p: 2, mb: 2 }}>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
                        <TextField
                          fullWidth
                          label="Drug ID"
                          value={drug.drugId}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateDrugInPrescription(index, 'drugId', e.target.value)}
                        />
                        <TextField
                          fullWidth
                          label="Dosage"
                          value={drug.dosage}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateDrugInPrescription(index, 'dosage', e.target.value)}
                        />
                      </Box>
                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
                        <TextField
                          fullWidth
                          label="Frequency"
                          value={drug.frequency}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateDrugInPrescription(index, 'frequency', e.target.value)}
                        />
                        <TextField
                          fullWidth
                          label="Duration"
                          value={drug.duration}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateDrugInPrescription(index, 'duration', e.target.value)}
                        />
                        <TextField
                          fullWidth
                          label="Quantity"
                          type="number"
                          value={drug.quantity}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateDrugInPrescription(index, 'quantity', e.target.value)}
                        />
                      </Box>
                      <TextField
                        fullWidth
                        label="Instructions"
                        value={drug.instructions}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateDrugInPrescription(index, 'instructions', e.target.value)}
                      />
                    </Box>
                    <IconButton
                      color="error"
                      onClick={() => removeDrugFromPrescription(index)}
                      disabled={formData.drugs.length === 1}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Paper>
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleAddPrescription} variant="contained">Save Prescription</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Prescriptions;
