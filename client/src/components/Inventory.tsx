import React, { useState, useEffect } from 'react';
import {
  Box, Button, Card, CardContent, Container, Dialog, DialogActions,
  DialogContent, DialogTitle, FormControl, IconButton, InputLabel,
  MenuItem, Paper, Select, Table, TableBody, TableCell, TableContainer,
  TableHead, TablePagination, TableRow, TextField, Typography, Chip,
  Alert, Snackbar, Tooltip, Fab
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  Visibility as ViewIcon, Download as DownloadIcon, Search as SearchIcon
} from '@mui/icons-material';

interface InventoryItem {
  _id: string;
  drug: { name: string; genericName: string; category: string; strength: string; form: string };
  store: { name: string; location: string };
  quantity: number;
  sellingPrice: number;
  status: string;
  updatedAt: string;
}

const Inventory: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });

  const [formData, setFormData] = useState({
    drugId: '', storeId: '', quantity: '', sellingPrice: ''
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await fetch('/api/inventory');
      const data = await response.json();
      if (data.success) setInventory(data.data);
    } catch (error) {
      showSnackbar('Error fetching inventory', 'error');
    }
  };

  const handleAddInventory = async () => {
    try {
      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        showSnackbar('Inventory added successfully', 'success');
        setOpenDialog(false);
        fetchInventory();
      }
    } catch (error) {
      showSnackbar('Error adding inventory', 'error');
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await fetch('/api/inventory/export/csv', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'inventory-export.csv';
        a.click();
        showSnackbar('Inventory exported successfully', 'success');
      }
    } catch (error) {
      showSnackbar('Error exporting inventory', 'error');
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const filteredInventory = inventory.filter(item =>
    item.drug.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container maxWidth="xl">
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <CardContent>
          <Typography variant="h4">Drug Inventory Management</Typography>
          <Typography variant="subtitle1">Manage drug inventory levels across all stores</Typography>
        </CardContent>
      </Card>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 3, mb: 3 }}>
        <Card>
          <CardContent>
            <Typography color="textSecondary">Total Items</Typography>
            <Typography variant="h4">{inventory.length}</Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography color="textSecondary">Low Stock</Typography>
            <Typography variant="h4" color="warning.main">
              {inventory.filter(item => item.quantity <= 10).length}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography color="textSecondary">Out of Stock</Typography>
            <Typography variant="h4" color="error.main">
              {inventory.filter(item => item.quantity === 0).length}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography color="textSecondary">Total Value</Typography>
            <Typography variant="h4" color="primary.main">
              ${inventory.reduce((sum, item) => sum + (item.quantity * item.sellingPrice), 0).toFixed(2)}
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
            Add Drug
          </Button>
        </Box>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Drug Name</TableCell>
              <TableCell>Store</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredInventory.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((item) => (
              <TableRow key={item._id}>
                <TableCell>
                  <Typography variant="subtitle2">{item.drug.name}</Typography>
                  <Typography variant="caption" color="textSecondary">
                    {item.drug.strength} {item.drug.form}
                  </Typography>
                </TableCell>
                <TableCell>{item.store.name}</TableCell>
                <TableCell>
                  <Chip
                    label={item.quantity}
                    color={item.quantity === 0 ? 'error' : item.quantity <= 10 ? 'warning' : 'success'}
                    size="small"
                  />
                </TableCell>
                <TableCell>${item.sellingPrice.toFixed(2)}</TableCell>
                <TableCell>
                  <Chip label={item.status} color="primary" size="small" />
                </TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => setEditingItem(item)}>
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
          count={filteredInventory.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => setPage(newPage)}
          onRowsPerPageChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Inventory Item</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              fullWidth
              label="Drug ID"
              value={formData.drugId}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, drugId: e.target.value })}
            />
            <TextField
              fullWidth
              label="Store ID"
              value={formData.storeId}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, storeId: e.target.value })}
            />
            <TextField
              fullWidth
              label="Quantity"
              type="number"
              value={formData.quantity}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, quantity: e.target.value })}
            />
            <TextField
              fullWidth
              label="Selling Price"
              type="number"
              value={formData.sellingPrice}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, sellingPrice: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleAddInventory} variant="contained">Add</Button>
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

export default Inventory;
