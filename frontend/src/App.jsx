import React, { useEffect } from 'react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import { store } from './redux/store';
import { initTheme } from './redux/authSlice';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AppRoutes from './routes/AppRoutes';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layout Wrapper to hide Header/Footer on Dashboards and Quiz attempt environment
const LayoutWrapper = () => {
  const location = useLocation();
  const dispatch = useDispatch();

  // Initialize theme class list on mount
  useEffect(() => {
    dispatch(initTheme());
  }, [dispatch]);

  const isDashboard = location.pathname.includes('-dashboard');
  const isAttempt = location.pathname.includes('/attempt');

  return (
    <div className="flex flex-col min-h-screen">
      {!isDashboard && !isAttempt && <Navbar />}
      
      <main className="flex-1">
        <AppRoutes />
      </main>

      {!isDashboard && !isAttempt && <Footer />}

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
};

function App() {
  return (
    <Provider store={store}>
      <Router>
        <LayoutWrapper />
      </Router>
    </Provider>
  );
}

export default App;
