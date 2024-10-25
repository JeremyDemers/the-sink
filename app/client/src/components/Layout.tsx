import React, { useContext }  from 'react';
import { ToastContainer } from 'react-toastify';

import Header from '@components/Header';
import Footer from '@components/Footer';
import SessionModal from '@components/SessionModal';
import { AuthContext } from '@context/AuthProvider';

interface Props {
  readonly children: React.ReactNode;
}

const Layout: React.FC<Props> = ({ children }) => {
  const { auth } = useContext(AuthContext);

  return (
    <div className="page">
      <Header />

      <main className="page-main container pt-4 pt-md-5">
        {children}
      </main>

      <ToastContainer
        autoClose={3000}
        draggable={false}
        position="bottom-center"
        closeOnClick
        pauseOnHover
        newestOnTop
      />

      <Footer />
      {auth && <SessionModal />}
    </div>
  );
};

export default Layout;
