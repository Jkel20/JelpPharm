import React, { useState, useEffect } from 'react';
import {
  Box, Button, Card, CardContent, Container, Dialog, DialogActions,
  DialogContent, DialogTitle, FormControl, IconButton, InputLabel,
  MenuItem, Paper, Select, Table, TableBody, TableCell, TableContainer,
  TableHead, TablePagination, TableRow, TextField, Typography, Chip,
  Alert, Snackbar, Tooltip, Fab, LinearProgress
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  Visibility as ViewIcon, Download as DownloadIcon, Search as SearchIcon,
  Receipt as ReceiptIcon, GetApp as ExportIcon
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

interface Sale {
  _id: string;
  drug: { name: string; genericName: string; brandName: string; strength: string; form: string };
  store: { name: string; location: string };
  customer: { name: string; phone: string; email?: string };
  cashier: { name: string };
  quantity: number;
  unitPrice: number;
  subtotal: number;
  discount: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
}

const Sales: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<Sale | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    drugId: '',
    storeId: '',
    customerId: '',
    quantity: '',
    unitPrice: '',
    discount: '0',
    paymentMethod: 'cash',
    customerNotes: ''
  });

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      const response = await fetch('/api/sales');
      const data = await response.json();
      if (data.success) setSales(data.data);
    } catch (error) {
      showSnackbar('Error fetching sales', 'error');
    }
  };

  const handleAddSale = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...formData,
          quantity: parseInt(formData.quantity),
          unitPrice: parseFloat(formData.unitPrice),
          discount: parseFloat(formData.discount)
        })
      });

      const data = await response.json();
      if (data.success) {
        showSnackbar('Sale completed successfully', 'success');
        setOpenDialog(false);
        resetForm();
        fetchSales();
      } else {
        showSnackbar(data.message || 'Error completing sale', 'error');
      }
    } catch (error) {
      console.error('Error completing sale:', error);
      showSnackbar('Error completing sale', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await fetch('/api/sales/export/csv', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sales-export.csv';
        a.click();
        showSnackbar('Sales exported successfully', 'success');
      }
    } catch (error) {
      showSnackbar('Error exporting sales', 'error');
    }
  };

  const generateReceipt = async (saleId: string) => {
    try {
      const response = await fetch(`/api/sales/${saleId}/receipt`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `receipt-${saleId}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        showSnackbar('Receipt generated successfully', 'success');
      }
    } catch (error) {
      console.error('Error generating receipt:', error);
      showSnackbar('Error generating receipt', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      drugId: '',
      storeId: '',
      customerId: '',
      quantity: '',
      unitPrice: '',
      discount: '0',
      paymentMethod: 'cash',
      customerNotes: ''
    });
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const filteredSales = sales.filter(sale =>
    sale.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.drug.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.cashier.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      case 'refunded': return 'info';
      default: return 'default';
    }
  };

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case 'cash': return 'success';
      case 'card': return 'primary';
      case 'mobile_money': return 'warning';
      case 'insurance': return 'info';
      default: return 'default';
    }
  };

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const totalOrders = sales.length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return (
    <Container maxWidth="xl">
      <StyledCard>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            Sales Management
          </Typography>
          <Typography variant="subtitle1">
            Manage drug sales, generate receipts, and track revenue across all stores
          </Typography>
        </CardContent>
      </StyledCard>

      {/* Summary Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 3 }}>
        <MetricCard>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Total Revenue
            </Typography>
            <Typography variant="h4" color="primary.main">
              ${totalRevenue.toFixed(2)}
            </Typography>
          </CardContent>
        </MetricCard>
        <MetricCard>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Total Orders
            </Typography>
            <Typography variant="h4" color="success.main">
              {totalOrders}
            </Typography>
          </CardContent>
        </MetricCard>
        <MetricCard>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Average Order Value
            </Typography>
            <Typography variant="h4" color="info.main">
              ${averageOrderValue.toFixed(2)}
            </Typography>
          </CardContent>
        </MetricCard>
        <MetricCard>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Today's Sales
            </Typography>
            <Typography variant="h4" color="warning.main">
              ${sales
                .filter(sale => new Date(sale.createdAt).toDateString() === new Date().toDateString())
                .reduce((sum, sale) => sum + sale.totalAmount, 0)
                .toFixed(2)}
            </Typography>
          </CardContent>
        </MetricCard>
      </Box>

      {/* Filters and Actions */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2, alignItems: 'center' }}>
          <TextField
            fullWidth
            label="Search"
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon />
            }}
          />
          <Button
            fullWidth
            variant="outlined"
            startIcon={<ExportIcon />}
            onClick={handleExportCSV}
          >
            Export Sales
          </Button>
          <Button
            fullWidth
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
          >
            New Sale
          </Button>
        </Box>
      </Paper>

      {/* Sales Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Drug</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Unit Price</TableCell>
              <TableCell>Discount</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Payment</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredSales.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((sale) => (
              <TableRow key={sale._id}>
                <TableCell>
                  {new Date(sale.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2">{sale.drug.name}</Typography>
                  <Typography variant="caption" color="textSecondary">
                    {sale.drug.strength} {sale.drug.form}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2">{sale.customer.name}</Typography>
                  <Typography variant="caption" color="textSecondary">
                    {sale.customer.phone}
                  </Typography>
                </TableCell>
                <TableCell>{sale.quantity}</TableCell>
                <TableCell>${sale.unitPrice.toFixed(2)}</TableCell>
                <TableCell>
                  {sale.discount > 0 ? (
                    <Chip label={`${sale.discount}%`} size="small" color="warning" />
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" color="primary.main">
                    ${sale.totalAmount.toFixed(2)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={sale.paymentMethod.toUpperCase()}
                    size="small"
                    color={getPaymentMethodColor(sale.paymentMethod) as any}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={sale.status}
                    size="small"
                    color={getStatusColor(sale.status) as any}
                  />
                </TableCell>
                <TableCell>
                  <Tooltip title="Generate Receipt">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => generateReceipt(sale._id)}
                    >
                      <ReceiptIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="View Details">
                    <IconButton
                      size="small"
                      onClick={() => setEditingItem(sale)}
                    >
                      <ViewIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton
                      size="small"
                      color="warning"
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredSales.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </TableContainer>

      {/* Add/Edit Sale Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>New Sale</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
              <TextField
                fullWidth
                label="Drug ID"
                value={formData.drugId}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, drugId: e.target.value })}
                required
              />
              <TextField
                fullWidth
                label="Store ID"
                value={formData.storeId}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, storeId: e.target.value })}
                required
              />
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
              <TextField
                fullWidth
                label="Customer ID"
                value={formData.customerId}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, customerId: e.target.value })}
                required
              />
              <TextField
                fullWidth
                label="Quantity"
                type="number"
                value={formData.quantity}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, quantity: e.target.value })}
                required
              />
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
              <TextField
                fullWidth
                label="Unit Price"
                type="number"
                value={formData.unitPrice}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, unitPrice: e.target.value })}
                required
              />
              <TextField
                fullWidth
                label="Discount (%)"
                type="number"
                value={formData.discount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, discount: e.target.value })}
                inputProps={{ min: 0, max: 100 }}
              />
            </Box>
            <FormControl fullWidth>
              <InputLabel>Payment Method</InputLabel>
              <Select
                value={formData.paymentMethod}
                onChange={(e: any) => setFormData({ ...formData, paymentMethod: e.target.value })}
                label="Payment Method"
              >
                <MenuItem value="cash">Cash</MenuItem>
                <MenuItem value="card">Card</MenuItem>
                <MenuItem value="mobile_money">Mobile Money</MenuItem>
                <MenuItem value="insurance">Insurance</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Customer Notes"
              multiline
              rows={3}
              value={formData.customerNotes}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, customerNotes: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={handleAddSale}
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Complete Sale'}
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

export default Sales;
