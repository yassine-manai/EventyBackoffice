import React from 'react';
import { Link } from 'react-router-dom';
import notfound from "../assets/notfound.png";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center">
      <img src={notfound} alt=''  className="w-72"/>
      <p className="mt-4 text-2xl font-semibold text-gray-800">
        Oops! Page n'est pas trouvée
      </p>
      <p className="mt-2 text-gray-600">
       La page que vous recherchez n'existe pas ou a été déplacée.
      </p>
      <Link
        to="/"
        className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
      >
        Retour au Accueil
      </Link>
    </div>
  );
};

export default NotFound;
