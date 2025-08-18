import React, { useState, useEffect } from 'react';
import {
  Box, Button, Card, CardContent, Container, Dialog, DialogActions,
  DialogContent, DialogTitle, FormControl, IconButton, InputLabel,
  MenuItem, Paper, Select, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TextField, Typography, Chip, Alert, Snackbar,
  Tooltip, Fab, LinearProgress, CircularProgress
} from '@mui/material';
import {
  Download as DownloadIcon, Schedule as ScheduleIcon, 
  GetApp as ExportIcon, Refresh as RefreshIcon,
  BarChart as ChartIcon, TrendingUp as TrendingIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  marginBottom: theme.spacing(3)
}));

const MetricCard = styled(Card)(({ theme }) => ({
  height: '100%',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8]
  }
}));

interface ReportData {
  type: string;
  period: string;
  totalSales?: number;
  totalOrders?: number;
  totalItems?: number;
  totalValue?: number;
  totalPrescriptions?: number;
  sales?: any[];
  inventory?: any[];
  prescriptions?: any[];
}

const Reports: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [openScheduleDialog, setOpenScheduleDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });
  
  const [reportConfig, setReportConfig] = useState({
    reportType: 'sales',
    startDate: '',
    endDate: '',
    storeId: '',
    format: 'json'
  });

  const [scheduleConfig, setScheduleConfig] = useState({
    reportType: 'sales',
    frequency: 'weekly',
    recipients: '',
    storeId: ''
  });

  useEffect(() => {
    // Set default dates (last 30 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    setReportConfig(prev => ({
      ...prev,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    }));
  }, []);

  const generateReport = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(reportConfig)
      });

      if (response.ok) {
        if (reportConfig.format === 'csv') {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${reportConfig.reportType}-report.csv`;
          a.click();
          window.URL.revokeObjectURL(url);
          showSnackbar('Report downloaded successfully', 'success');
        } else {
          const data = await response.json();
          if (data.success) {
            setReportData(data.data);
            showSnackbar('Report generated successfully', 'success');
          }
        }
      }
    } catch (error) {
      console.error('Error generating report:', error);
      showSnackbar('Error generating report', 'error');
    } finally {
      setLoading(false);
    }
  };

  const scheduleReport = async () => {
    try {
      const response = await fetch('/api/reports/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(scheduleConfig)
      });

      const data = await response.json();
      if (data.success) {
        showSnackbar('Report scheduled successfully', 'success');
        setOpenScheduleDialog(false);
      }
    } catch (error) {
      console.error('Error scheduling report:', error);
      showSnackbar('Error scheduling report', 'error');
    }
  };

  const downloadFullReport = async () => {
    try {
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...reportConfig,
          format: 'csv'
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `full-${reportConfig.reportType}-report.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        showSnackbar('Full report downloaded successfully', 'success');
      }
    } catch (error) {
      console.error('Error downloading full report:', error);
      showSnackbar('Error downloading full report', 'error');
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const getReportTypeLabel = (type: string) => {
    switch (type) {
      case 'sales': return 'Sales Report';
      case 'inventory': return 'Inventory Report';
      case 'prescriptions': return 'Prescriptions Report';
      default: return type;
    }
  };

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'monthly': return 'Monthly';
      case 'quarterly': return 'Quarterly';
      default: return frequency;
    }
  };

  return (
    <Container maxWidth="xl">
      <StyledCard>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            Reports & Analytics
          </Typography>
          <Typography variant="subtitle1">
            Generate comprehensive reports, schedule automated reporting, and export data for analysis
          </Typography>
        </CardContent>
      </StyledCard>

      {/* Report Configuration */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Report Configuration
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 3 }}>
          <FormControl fullWidth>
            <InputLabel>Report Type</InputLabel>
            <Select
              value={reportConfig.reportType}
              onChange={(e: any) => setReportConfig({ ...reportConfig, reportType: e.target.value })}
              label="Report Type"
            >
              <MenuItem value="sales">Sales Report</MenuItem>
              <MenuItem value="inventory">Inventory Report</MenuItem>
              <MenuItem value="prescriptions">Prescriptions Report</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Start Date"
            type="date"
            value={reportConfig.startDate}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReportConfig({ ...reportConfig, startDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            label="End Date"
            type="date"
            value={reportConfig.endDate}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReportConfig({ ...reportConfig, endDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
          <FormControl fullWidth>
            <InputLabel>Format</InputLabel>
            <Select
              value={reportConfig.format}
              onChange={(e: any) => setReportConfig({ ...reportConfig, format: e.target.value })}
              label="Format"
            >
              <MenuItem value="json">JSON</MenuItem>
              <MenuItem value="csv">CSV</MenuItem>
            </Select>
          </FormControl>
        </Box>
        
        <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={generateReport}
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Generate Report'}
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<ExportIcon />}
            onClick={downloadFullReport}
          >
            Download Full Report
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<ScheduleIcon />}
            onClick={() => setOpenScheduleDialog(true)}
          >
            Schedule Report
          </Button>
        </Box>

        {loading && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress />
            <Typography variant="body2" sx={{ mt: 1 }}>
              Generating {getReportTypeLabel(reportConfig.reportType)}...
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Report Results */}
      {reportData && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            {reportData.type} - {reportData.period}
          </Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3, mb: 3 }}>
            {reportData.totalSales !== undefined && (
              <MetricCard>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Sales
                  </Typography>
                  <Typography variant="h4" color="primary.main">
                    ${reportData.totalSales?.toFixed(2)}
                  </Typography>
                </CardContent>
              </MetricCard>
            )}
            
            {reportData.totalOrders !== undefined && (
              <MetricCard>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Orders
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {reportData.totalOrders}
                  </Typography>
                </CardContent>
              </MetricCard>
            )}
            
            {reportData.totalItems !== undefined && (
              <MetricCard>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Items
                  </Typography>
                  <Typography variant="h4" color="info.main">
                    {reportData.totalItems}
                  </Typography>
                </CardContent>
              </MetricCard>
            )}
            
            {reportData.totalValue !== undefined && (
              <MetricCard>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Value
                  </Typography>
                  <Typography variant="h4" color="warning.main">
                    ${reportData.totalValue?.toFixed(2)}
                  </Typography>
                </CardContent>
              </MetricCard>
            )}
            
            {reportData.totalPrescriptions !== undefined && (
              <MetricCard>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Prescriptions
                  </Typography>
                  <Typography variant="h4" color="secondary.main">
                    {reportData.totalPrescriptions}
                  </Typography>
                </CardContent>
              </MetricCard>
            )}
          </Box>

          {/* Data Tables */}
          {reportData.sales && reportData.sales.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>Sales Data</Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Drug</TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reportData.sales.slice(0, 10).map((sale: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell>{new Date(sale.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>{sale.drug?.name || 'N/A'}</TableCell>
                        <TableCell>{sale.customer?.name || 'N/A'}</TableCell>
                        <TableCell>{sale.quantity}</TableCell>
                        <TableCell>${sale.totalAmount?.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {reportData.inventory && reportData.inventory.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>Inventory Data</Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Drug</TableCell>
                      <TableCell>Store</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Price</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reportData.inventory.slice(0, 10).map((item: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell>{item.drug?.name || 'N/A'}</TableCell>
                        <TableCell>{item.store?.name || 'N/A'}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>${item.sellingPrice?.toFixed(2)}</TableCell>
                        <TableCell>
                          <Chip label={item.status} size="small" color="primary" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {reportData.prescriptions && reportData.prescriptions.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>Prescriptions Data</Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Patient</TableCell>
                      <TableCell>Doctor</TableCell>
                      <TableCell>Drugs</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reportData.prescriptions.slice(0, 10).map((prescription: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell>{new Date(prescription.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>{prescription.patient?.name || 'N/A'}</TableCell>
                        <TableCell>{prescription.doctor?.name || 'N/A'}</TableCell>
                        <TableCell>{prescription.drugs?.length || 0} drugs</TableCell>
                        <TableCell>
                          <Chip label={prescription.status} size="small" color="primary" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </Paper>
      )}

      {/* Schedule Report Dialog */}
      <Dialog open={openScheduleDialog} onClose={() => setOpenScheduleDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Schedule Automated Report</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Report Type</InputLabel>
              <Select
                value={scheduleConfig.reportType}
                onChange={(e: any) => setScheduleConfig({ ...scheduleConfig, reportType: e.target.value })}
                label="Report Type"
              >
                <MenuItem value="sales">Sales Report</MenuItem>
                <MenuItem value="inventory">Inventory Report</MenuItem>
                <MenuItem value="prescriptions">Prescriptions Report</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Frequency</InputLabel>
              <Select
                value={scheduleConfig.frequency}
                onChange={(e: any) => setScheduleConfig({ ...scheduleConfig, frequency: e.target.value })}
                label="Frequency"
              >
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="quarterly">Quarterly</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Recipients (comma-separated emails)"
              value={scheduleConfig.recipients}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setScheduleConfig({ ...scheduleConfig, recipients: e.target.value })}
              placeholder="email1@example.com, email2@example.com"
            />
            <TextField
              fullWidth
              label="Store ID (optional)"
              value={scheduleConfig.storeId}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setScheduleConfig({ ...scheduleConfig, storeId: e.target.value })}
              placeholder="Leave empty for all stores"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenScheduleDialog(false)}>Cancel</Button>
          <Button onClick={scheduleReport} variant="contained">
            Schedule Report
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
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

export default Reports;
