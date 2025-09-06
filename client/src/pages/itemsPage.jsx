import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from "react-router-dom";
import ItemCard from "../components/itemCard";

const ItemsPage = () => {

  const [products, setProducts] = useState([]);
  // const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTcgsProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/items');
        const items = response.data
        setProducts(items);
      } catch (err) {
        setError('Failed to fetch sports products.');
      }
    };

    fetchTcgsProducts();
  }, []);

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 justify-items-center">

      {products.map((item) => (
        <ItemCard
          key={item.id}
          name={item.name}
          description={item.description}
          price={item.price}
          image={item.img}
        />
      ))}
    </div>
    );

};

export default ItemsPage;
