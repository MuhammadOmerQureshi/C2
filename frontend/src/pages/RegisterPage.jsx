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
  return (
    <form onSubmit={onSubmit}>
      <input name="name" onChange={onChange} placeholder="Name" required/>
      <input name="email" onChange={onChange} placeholder="Email" required/>
      <input name="password" type="password" onChange={onChange} placeholder="Password" required/>
      <select name="role" onChange={onChange}>
        <option value="employee">Employee</option>
        <option value="employer">Employer</option>
      </select>
      <button type="submit">Sign Up</button>
    </form>
  );
}

