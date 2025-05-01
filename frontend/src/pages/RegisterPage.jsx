import { useState } from 'react';
import api from '../api/axiosConfig';
export default function RegisterPage() {
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'employee' });
  const onChange = e => setForm({...form,[e.target.name]:e.target.value});
  const onSubmit = async e => {
    e.preventDefault();
    await api.post('/auth/register', form);
    alert('Registered! Now log in.');
  };
  