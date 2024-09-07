import React, { useState } from 'react';
import { Container, TextField, Button, Box, Typography, Grid, IconButton, InputAdornment, FormControl } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import main_icon from '../assets/icon_beercheers.png';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';

function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    age: '',
    handle: '',
    password: '',
    password_confirmation: '',
    address_attributes: {
      line1: '',
      line2: '',
      city: '',
      country: '',
    },
  });
  const [showPassword, setShowPassword] = useState(false);

	const handleChange = (e) => {
		const { name, value } = e.target;
		if (name.startsWith("address_attributes.")) {
			setFormData({
				...formData,
				address_attributes: {
					...formData.address_attributes,
					[name.split(".")[1]]: value
				}
			});
		} else {
			setFormData({ ...formData, [name]: value });
		}
	};

  const handleClickShowPassword = () => setShowPassword(!showPassword);

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (formData.password !== formData.password_confirmation) {
			alert("Passwords don't match");
			return;
		}
	
		try {
			const response = await fetch('api//api/v1/signup', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ user: { 
					first_name: formData.first_name,
					last_name: formData.last_name,
					email: formData.email,
					handle: formData.handle,
					password: formData.password,
					password_confirmation: formData.password_confirmation
				} }),
			});
	
			if (response.ok) {
				navigate('/');
				/*const userData = await response.json();
				console.log("User Data:", userData);
				const userId = userData.data.id;
				
				const updateResponse = await fetch(`api//api/v1/users/${userId}`, {
					method: 'PUT',
					headers: { 
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${userData.token}`
					},
					body: JSON.stringify({ 
						user: {
							age: formData.age,
							address_attributes: formData.address_attributes
						} 
					}),
				});
	
				if (updateResponse.ok) {
					navigate('/');
				} else {
					const errorData = await updateResponse.json();
					console.error("Error updating user:", errorData);
				}*/
			} else {
				const errorData = await response.json();
				console.error("Error creating user:", errorData);
			}
		} catch (error) {
			console.error("Error:", error);
		}
	};

	const textFieldStyle = {
    backgroundColor: '#D9D9D9',
    borderRadius: '8px',
    '& .MuiInputBase-input': {
      color: '#606060',
    },
    '& .MuiInputLabel-root': {
      color: '#787878',
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: '#787878',
    },
    '& .MuiFilledInput-root': {
      borderRadius: '8px',
      backgroundColor: '#D9D9D9',
    },
    '& .MuiFilledInput-root:before': {
      borderColor: '#303030',
    },
    '& .MuiFilledInput-root:hover:before': {
      borderColor: '#303030',
    },
    '& .MuiFilledInput-root:after': {
      borderColor: '#303030',
    },
  };

	
  return (
    <Container component="main" maxWidth="xs">
			<Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginTop: 8,
          position: 'relative',
        }}
      >
				<Box
					component="img"
					src={main_icon}
					alt="Icon"
					sx={{ width: 100, height: 'auto', marginBottom: 1 }}
				/>

				<Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3 }}>
					<IconButton
						onClick={() => navigate('/')}
						sx={{
							position: 'absolute',
							top: 0,
							right: 0,
							margin: 1,
							color: 'white'
						}}
					>
						<CloseIcon />
					</IconButton>
					
					<Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 1 }}>
						<Typography variant="body2" sx={{ color: 'white', textAlign: 'center', mt: 1 }}>
							About you
						</Typography>
					</Box>
					<Grid container spacing={2}>
						<Grid item xs={6}>
							<TextField label="First Name" name="first_name" required fullWidth variant="filled" value={formData.first_name} onChange={handleChange} sx={textFieldStyle} />
						</Grid>
						<Grid item xs={6}>
							<TextField label="Last Name" name="last_name" required fullWidth variant="filled" value={formData.last_name} onChange={handleChange} sx={textFieldStyle} />
						</Grid>
						<Grid item xs={12}>
							<TextField label="Email" name="email" required fullWidth variant="filled" value={formData.email} onChange={handleChange} sx={textFieldStyle} />
						</Grid>
						<Grid item xs={4}>
							<TextField label="Age" name="age" required fullWidth variant="filled" value={formData.age} onChange={handleChange} sx={textFieldStyle} />
						</Grid>
						<Grid item xs={8}>
							<TextField label="Handle" name="handle" required fullWidth variant="filled" value={formData.handle} onChange={handleChange} sx={textFieldStyle} />
						</Grid>
						<Grid item xs={12}>
							<TextField label="Line 1 (Optional)" name="address_attributes.line1" fullWidth variant="filled" value={formData.address_attributes.line1} onChange={handleChange} sx={textFieldStyle} />
						</Grid>
						<Grid item xs={12}>
							<TextField label="Line 2 (Optional)" name="address_attributes.line2" fullWidth variant="filled" value={formData.address_attributes.line2} onChange={handleChange} sx={textFieldStyle} />
						</Grid>
						<Grid item xs={6}>
							<TextField label="City (Optional)" name="address_attributes.city" fullWidth variant="filled" value={formData.address_attributes.city} onChange={handleChange} sx={textFieldStyle} />
						</Grid>
						<Grid item xs={6}>
							<TextField label="Country" name="address_attributes.country" fullWidth variant="filled" value={formData.address_attributes.country} onChange={handleChange} sx={textFieldStyle} />
						</Grid>
						
						<Grid item xs={12} md={6}>

							<Grid container spacing={2}>
								<Grid item xs={12}>
									<Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 1 }}>
										<Typography variant="body2" sx={{ color: 'white', textAlign: 'center'}}>
											Enter your password
										</Typography>
									</Box>
									<FormControl fullWidth variant="filled">
										<TextField
											label="Password"
											name="password"
											variant="filled"
											required
											type={showPassword ? 'text' : 'password'}
											value={formData.password}
											onChange={handleChange} sx={textFieldStyle}
											InputProps={{
												endAdornment: (
													<InputAdornment position="end">
														<IconButton onClick={handleClickShowPassword}>
															{showPassword ? <VisibilityOff /> : <Visibility />}
														</IconButton>
													</InputAdornment>
												),
											}}
										/>
									</FormControl>
								</Grid>
							</Grid>

							<Grid container spacing={2} mt={2}>
								<Grid item xs={12}>
									<TextField
										label="Confirm Password"
										name="password_confirmation"
										required
										fullWidth
										variant="filled"
										type={showPassword ? 'text' : 'password'}
										value={formData.password_confirmation}
										onChange={handleChange} sx={textFieldStyle}
										InputProps={{
											endAdornment: (
												<InputAdornment position="end">
													<IconButton onClick={handleClickShowPassword}>
														{showPassword ? <VisibilityOff /> : <Visibility />}
													</IconButton>
												</InputAdornment>
											),
										}}
									/>
								</Grid>
							</Grid>
						</Grid>

						<Grid item xs={10} md={6}>
							<Button
								type="submit"
								variant="contained"
								sx={{
									mt: 3,
									mb: 2,
									backgroundColor: '#CFB523',
									color: 'white',
									borderRadius: '75px',
									'&:hover': {
										backgroundColor: '#b89f3e',
									},
									fontSize: '1.25rem',
									'& .MuiButton-startIcon': {
										mr: 1,
									},
									minWidth: '200px',
									minHeight: '125px',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center'
								}}
							>
								<AddIcon sx={{ mr: 1 }} />
								Create
							</Button>
						</Grid>
					</Grid>
				</Box>
			</Box>
    </Container>
  );
}

export default SignUp;
