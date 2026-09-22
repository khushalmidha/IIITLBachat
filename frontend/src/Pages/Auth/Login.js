// LoginPage.js
import { useCallback, useEffect, useMemo, useState } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { loginAPI } from "../../utils/ApiRequest";
import GoogleAuthButton from "./GoogleAuthButton";
const Login = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const user = JSON.parse(savedUser);
      navigate(user.isAvatarImageSet && user.avatarImage ? "/dashboard" : "/setAvatar");
    }
  }, [navigate]);

  const [values, setValues] = useState({
    email: "",
    password: "",
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
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleGoogleSuccess = useCallback((data) => {
    localStorage.setItem("user", JSON.stringify(data.user));
    toast.success(data.message, toastOptions);
    navigate(data.user?.isAvatarImageSet && data.user?.avatarImage ? "/dashboard" : "/setAvatar");
  }, [navigate, toastOptions]);

  const handleGoogleError = useCallback((message) => {
    toast.error(message, toastOptions);
  }, [toastOptions]);

  const handleSubmit = async (e) => {
    try{e.preventDefault();

    const { email, password } = values;

    setLoading(true);

    const res = await axios.post(loginAPI, {
      email,
      password,
    });
    // console.log(data);
    console.log(res);
    const data = res.data
    if (data.success === true) {
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate(data.user?.isAvatarImageSet && data.user?.avatarImage ? "/dashboard" : "/setAvatar");
      toast.success(data.message, toastOptions);
      setLoading(false);
    } else {
      console.log("data",data)
      toast.error(data.message, toastOptions);
      setLoading(false);
    }}
    catch(err){
      toast.error(err.response?.data?.message || "Kindly Login Again",toastOptions)
      setLoading(false)
    }
  };

  return (
    <div style={{ position: "relative", overflow: "hidden", minHeight: "100vh", background: "#f4f6f8" }}>
      <Container
        className="mt-5"
        style={{ position: "relative", zIndex: "2 !important" }}
      >
        <Row>
          <Col md={{ span: 6, offset: 3 }}>
            <h1 className="text-center mt-5" style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '16px' }}>
              <span style={{ color: '#111827' }}>IIITL</span>{' '}
              <span style={{ color: '#6C47FF' }}>Bachat</span>
            </h1>
            <h2 className="text-center" style={{ color: "#111827" }}>Login</h2>
            <Form>
              <Form.Group controlId="formBasicEmail" className="mt-3">
                <Form.Label style={{ color: "#475569", fontWeight: 600 }}>Email address</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter email"
                  name="email"
                  onChange={handleChange}
                  value={values.email}
                />
              </Form.Group>

              <Form.Group controlId="formBasicPassword" className="mt-3">
                <Form.Label style={{ color: "#475569", fontWeight: 600 }}>Password</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  placeholder="Password"
                  onChange={handleChange}
                  value={values.password}
                />
              </Form.Group>
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                }}
                className="mt-4"
              >
                <Button
                  type="submit"
                  className=" text-center mt-3 btnStyle"
                  onClick={!loading ? handleSubmit : null}
                  disabled={loading}
                >
                  {loading ? "Signin…" : "Login"}
                </Button>
                <p className="mt-3 mb-0 text-center" style={{ color: "#64748b", fontSize: 14 }}>
                  New here? Please sign up first, then choose your avatar.
                </p>
              <GoogleAuthButton
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                />
                <p className="mt-3" style={{ color: "#475569" }}>
                  Don't Have an Account?{" "}
                  <Link to="/register" className="lnk" style={{ color: "#6C47FF", fontWeight: 700 }}>
                    Register
                  </Link>
                </p>
              </div>
            </Form>
          </Col>
        </Row>
        <ToastContainer />
      </Container>
    </div>
  );
};

export default Login;
