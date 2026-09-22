// SignupPage.js
import { useCallback, useEffect, useMemo, useState } from "react";
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import "./auth.css";

import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { registerAPI } from "../../utils/ApiRequest";
import axios from "axios";
import GoogleAuthButton from "./GoogleAuthButton";

const Register = () => {

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if(savedUser){
      const user = JSON.parse(savedUser);
      navigate(user.isAvatarImageSet && user.avatarImage ? "/dashboard" : "/setAvatar");
    }
  }, [navigate]);

  const [values, setValues] = useState({
    name : "",
    email : "",
    password : "",

  });

  const toastOptions = useMemo(() => ({
    position: "bottom-right",
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: true,
    progress: undefined,
    theme: "dark",
  }), []);

  const handleChange = (e) => {
    setValues({...values , [e.target.name]: e.target.value});
  }
   const handleGoogleSuccess = useCallback((data) => {
    localStorage.setItem("user", JSON.stringify(data.user));
    toast.success(data.message, toastOptions);
    navigate(data.user?.isAvatarImageSet && data.user?.avatarImage ? "/dashboard" : "/setAvatar");
  }, [navigate, toastOptions]);

  const handleGoogleError = useCallback((message) => {
    toast.error(message, toastOptions);
  }, [toastOptions]);
  const handleSubmit = async (e) => {
  try{
    e.preventDefault();

      const {name, email, password} = values;

      setLoading(false);
     
      const {data} = await axios.post(registerAPI, {
        name,
        email,
        password
      });

      if(data.success === true){
        delete data.user.password;
        localStorage.setItem("user", JSON.stringify(data.user));
        toast.success(data.message, toastOptions);
        setLoading(true);
        navigate(data.user?.isAvatarImageSet && data.user?.avatarImage ? "/dashboard" : "/setAvatar");
      }
      else{
        toast.error(data.message, toastOptions);
        setLoading(false);
      }
      } catch (err) {
      toast.error(err.response?.data?.message || "Signup failed", toastOptions);
      setLoading(false);
    }
    };

  return (
    <>
    <div style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh', background: '#f4f6f8' }}>

      <Container className="mt-5" style={{position: 'relative', zIndex: "2 !important" }}>
      <Row>
        <h1 className="text-center mt-5" style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '16px' }}>
          <span style={{ color: '#111827' }}>IIITL</span>{' '}
          <span style={{ color: '#6C47FF' }}>Bachat</span>
        </h1>
        <h1 className="text-center" style={{ color: "#111827", fontWeight: 800 }}>Welcome to Expense Management System</h1>
        <Col md={{ span: 6, offset: 3 }}>
          <h2 className="text-center mt-5" style={{ color: "#111827" }}>Registration</h2>
          <Form>
            <Form.Group controlId="formBasicName" className="mt-3" >
              <Form.Label style={{ color: "#475569", fontWeight: 600 }}>Name</Form.Label>
              <Form.Control type="text"  name="name" placeholder="Full name" value={values.name} onChange={handleChange} />
            </Form.Group>
            <Form.Group controlId="formBasicEmail" className="mt-3">
              <Form.Label style={{ color: "#475569", fontWeight: 600 }}>Email address</Form.Label>
              <Form.Control type="email"  name="email" placeholder="Enter email" value={values.email} onChange={handleChange}/>
            </Form.Group>

            <Form.Group controlId="formBasicPassword" className="mt-3">
              <Form.Label style={{ color: "#475569", fontWeight: 600 }}>Password</Form.Label>
              <Form.Control type="password"  name="password" placeholder="Password" value={values.password} onChange={handleChange} />
            </Form.Group>
            <div style={{width: "100%", display: "flex" , alignItems:"center", justifyContent:"center", flexDirection: "column"}} className="mt-4">
              <Button
                  type="submit"
                  className=" text-center mt-3 btnStyle"
                  onClick={!loading ? handleSubmit : null}
                  disabled={loading}
                >
                  {loading ? "Registering..." : "Signup"}
                </Button>
                <p className="mt-3 mb-0 text-center" style={{ color: "#64748b", fontSize: 14 }}>
                  After signup, you will select an avatar to finish your profile.
                </p>
               <GoogleAuthButton
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
              />

              <p className="mt-3" style={{color: "#475569"}}>Already have an account? <Link to="/login" className="lnk" style={{ color: "#6C47FF", fontWeight: 700 }} >Login</Link></p>
            </div>
          </Form>
        </Col>
      </Row>
    <ToastContainer />
    </Container>
    </div>
    </>
  )
}

export default Register
