import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Plus, 
  MapPin,
  Phone,
  Mail,
  Users,
  Package
} from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import { Card, CardHeader, CardContent } from '../components/ui/Card';

interface Store {
  id: string;
  name: string;
  location: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  phone: string;
  email?: string;
  manager: string;
  isActive: boolean;
  staffCount: number;
  inventoryCount: number;
  createdAt: string;
}

export const Stores: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Ghana',
    phone: '',
    email: '',
    manager: ''
  });

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      const mockStores: Store[] = [
        {
          id: '1',
          name: 'Main Pharmacy Store',
          location: 'Accra Central',
          address: {
            street: '123 High Street',
            city: 'Accra',
            state: 'Greater Accra',
            zipCode: '00233',
            country: 'Ghana'
          },
          phone: '+233201234567',
          email: 'main@jelppharm.com',
          manager: 'John Doe',
          isActive: true,
          staffCount: 15,
          inventoryCount: 2500,
          createdAt: '2024-01-15'
        }
      ];
      setStores(mockStores);
    } catch (error) {
      console.error('Error fetching stores:', error);
    }
  };

  const handleAddStore = async () => {
    try {
      const newStore: Store = {
        id: Date.now().toString(),
        name: formData.name,
        location: formData.location,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country
        },
        phone: formData.phone,
        email: formData.email,
        manager: formData.manager,
        isActive: true,
        staffCount: 0,
        inventoryCount: 0,
        createdAt: new Date().toISOString().split('T')[0]
      };
      
      setStores([...stores, newStore]);
      setShowAddModal(false);
      resetForm();
    } catch (error) {
      console.error('Error adding store:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      location: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Ghana',
      phone: '',
      email: '',
      manager: ''
    });
  };

  const filteredStores = stores.filter(store => {
    return store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           store.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
           store.address.city.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Store Management</h1>
        <p className="text-gray-600">Manage pharmacy store locations and operations</p>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Search stores by name, location, or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Store
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStores.map((store) => (
          <Card key={store.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{store.name}</h3>
                    <p className="text-sm text-gray-500">{store.location}</p>
                  </div>
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  store.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {store.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{store.address.street}, {store.address.city}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="w-4 h-4 mr-2" />
                  <span>{store.phone}</span>
                </div>
                {store.email && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="w-4 h-4 mr-2" />
                    <span>{store.email}</span>
                  </div>
                )}
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="w-4 h-4 mr-2" />
                  <span>{store.staffCount} staff members</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Package className="w-4 h-4 mr-2" />
                  <span>{store.inventoryCount} inventory items</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Store"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Store Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label="Location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Street Address"
              value={formData.street}
              onChange={(e) => setFormData({ ...formData, street: e.target.value })}
              required
            />
            <Input
              label="City"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="State/Region"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              required
            />
            <Input
              label="ZIP Code"
              value={formData.zipCode}
              onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <Input
            label="Manager"
            value={formData.manager}
            onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
            required
          />
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddStore}>
              Add Store
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
