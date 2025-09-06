import React from "react";

const InstagramGrid = () => {
  const posts = [
    {
      url: "https://www.instagram.com/tadybakingco/p/DJ-xqOUsDhS/",
      image: "https://www.instagram.com/tadybakingco/p/DJ-xqOUsDhS/",
    },
    {
      url: "https://www.instagram.com/p/XXXXX2/",
      image: "https://instagram.com/path/to/image2.jpg",
    },
    {
      url: "https://www.instagram.com/p/XXXXX3/",
      image: "https://instagram.com/path/to/image3.jpg",
    },
    {
      url: "https://www.instagram.com/p/XXXXX4/",
      image: "https://instagram.com/path/to/image4.jpg",
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 my-10">
      <h2 className="text-3xl font-bold text-[#4b2e24] text-center mb-6">
        Follow Us on Instagram
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {posts.map((post, index) => (
          <a
            key={index}
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-xl overflow-hidden shadow-md hover:opacity-90 transition"
          >
            <img
              src={post.image}
              alt={`Instagram post ${index + 1}`}
              className="w-full h-48 object-cover"
            />
          </a>
        ))}
      </div>
    </div>
  );
};

export default InstagramGrid;
