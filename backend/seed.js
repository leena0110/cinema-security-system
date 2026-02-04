const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Movie = require('./models/Movie.model');
const User = require('./models/User.model');
const connectDB = require('./config/database');

dotenv.config();

// Sample movie data
const movies = [
  {
    title: "The Matrix Resurrections",
    description: "Return to a world of two realities: one, everyday life; the other, what lies behind it. To find out if his reality is a physical or mental construct, to truly know himself, Mr. Anderson will have to choose to follow the white rabbit once more.",
    genre: "Sci-Fi, Action",
    duration: 148,
    rating: "R",
    language: "English",
    posterUrl: "https://image.tmdb.org/t/p/w500/8c4a8kE7PizaGQQnditMmI1xbRp.jpg",
    showtimes: [
      {
        time: "10:00 AM",
        date: new Date('2026-02-15'),
        price: 250
      },
      {
        time: "02:00 PM",
        date: new Date('2026-02-15'),
        price: 300
      },
      {
        time: "06:00 PM",
        date: new Date('2026-02-15'),
        price: 350
      },
      {
        time: "09:30 PM",
        date: new Date('2026-02-15'),
        price: 300
      }
    ],
    isActive: true
  },
  {
    title: "Inception",
    description: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O., but his tragic past may doom the project and his team to disaster.",
    genre: "Sci-Fi, Thriller",
    duration: 148,
    rating: "PG-13",
    language: "English",
    posterUrl: "https://image.tmdb.org/t/p/w500/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg",
    showtimes: [
      {
        time: "11:00 AM",
        date: new Date('2026-02-16'),
        price: 200
      },
      {
        time: "03:00 PM",
        date: new Date('2026-02-16'),
        price: 250
      },
      {
        time: "07:00 PM",
        date: new Date('2026-02-16'),
        price: 300
      }
    ],
    isActive: true
  },
  {
    title: "Interstellar",
    description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival. Experience the breathtaking journey across the cosmos.",
    genre: "Sci-Fi, Drama",
    duration: 169,
    rating: "PG-13",
    language: "English",
    posterUrl: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    showtimes: [
      {
        time: "10:30 AM",
        date: new Date('2026-02-17'),
        price: 220
      },
      {
        time: "02:30 PM",
        date: new Date('2026-02-17'),
        price: 280
      },
      {
        time: "06:30 PM",
        date: new Date('2026-02-17'),
        price: 320
      },
      {
        time: "10:00 PM",
        date: new Date('2026-02-17'),
        price: 280
      }
    ],
    isActive: true
  },
  {
    title: "Avatar: The Way of Water",
    description: "Jake Sully lives with his newfound family formed on the extrasolar moon Pandora. Once a familiar threat returns to finish what was previously started, Jake must work with Neytiri and the army of the Na'vi race to protect their home.",
    genre: "Action, Adventure",
    duration: 192,
    rating: "PG-13",
    language: "English",
    posterUrl: "https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg",
    showtimes: [
      {
        time: "09:00 AM",
        date: new Date('2026-02-18'),
        price: 300
      },
      {
        time: "01:00 PM",
        date: new Date('2026-02-18'),
        price: 350
      },
      {
        time: "05:00 PM",
        date: new Date('2026-02-18'),
        price: 400
      },
      {
        time: "09:00 PM",
        date: new Date('2026-02-18'),
        price: 350
      }
    ],
    isActive: true
  },
  {
    title: "Dune: Part Two",
    description: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe, he must prevent a terrible future only he can foresee.",
    genre: "Sci-Fi, Adventure",
    duration: 166,
    rating: "PG-13",
    language: "English",
    posterUrl: "https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg",
    showtimes: [
      {
        time: "11:30 AM",
        date: new Date('2026-02-19'),
        price: 280
      },
      {
        time: "03:30 PM",
        date: new Date('2026-02-19'),
        price: 330
      },
      {
        time: "07:30 PM",
        date: new Date('2026-02-19'),
        price: 380
      }
    ],
    isActive: true
  },
  {
    title: "Oppenheimer",
    description: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb. A thrilling exploration of the man behind the Manhattan Project.",
    genre: "Biography, Drama",
    duration: 180,
    rating: "R",
    language: "English",
    posterUrl: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    showtimes: [
      {
        time: "10:00 AM",
        date: new Date('2026-02-20'),
        price: 260
      },
      {
        time: "02:00 PM",
        date: new Date('2026-02-20'),
        price: 310
      },
      {
        time: "06:00 PM",
        date: new Date('2026-02-20'),
        price: 360
      },
      {
        time: "09:45 PM",
        date: new Date('2026-02-20'),
        price: 310
      }
    ],
    isActive: true
  }
];

// Initialize seats for each showtime
const initializeSeats = (showtimes) => {
  return showtimes.map(showtime => {
    const seats = [];
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const seatsPerRow = 12;

    rows.forEach(row => {
      for (let i = 1; i <= seatsPerRow; i++) {
        let price = showtime.price;
        
        // Dynamic pricing based on seat position
        if (row === 'A' || row === 'B') {
          price = Math.round(price * 0.8); // Front seats - 20% discount
        } else if (row === 'E' || row === 'F') {
          price = Math.round(price * 1.2); // Premium seats - 20% premium
        }

        seats.push({
          seatNumber: i.toString().padStart(2, '0'),
          row: row,
          status: 'available',
          price: price
        });
      }
    });

    return {
      ...showtime,
      seats,
      availableSeats: seats.length
    };
  });
};

// Sample users
const users = [
  {
    username: 'admin',
    email: 'leenasri0110@gmail.com',
    password: 'Admin@123',
    role: 'admin',
    isVerified: true
  },
  {
    username: 'manager',
    email: 'leenasri0110@gmail.com',
    password: 'Manager@123',
    role: 'manager',
    isVerified: true
  },
  {
    username: 'john_doe',
    email: 'john@example.com',
    password: 'User@123',
    role: 'user',
    isVerified: true
  },
  {
    username: 'jane_smith',
    email: 'jane@example.com',
    password: 'User@123',
    role: 'user',
    isVerified: true
  },
  {
    username: 'mike_wilson',
    email: 'mike.wilson@example.com',
    password: 'User@123',
    role: 'user',
    isVerified: true
  },
  {
    username: 'sarah_jones',
    email: 'sarah.jones@example.com',
    password: 'User@123',
    role: 'user',
    isVerified: true
  },
  {
    username: 'david_brown',
    email: 'david.brown@example.com',
    password: 'User@123',
    role: 'user',
    isVerified: true
  },
  {
    username: 'emily_davis',
    email: 'emily.davis@example.com',
    password: 'User@123',
    role: 'user',
    isVerified: true
  },
  {
    username: 'chris_miller',
    email: 'chris.miller@example.com',
    password: 'User@123',
    role: 'user',
    isVerified: false
  },
  {
    username: 'lisa_taylor',
    email: 'lisa.taylor@example.com',
    password: 'User@123',
    role: 'user',
    isVerified: true
  }
];

// Seed function
const seedDatabase = async () => {
  try {
    // Connect to database
    await connectDB();

    console.log('Connected to database');

    // Clear only movies (keep users unless --reset flag is passed)
    await Movie.deleteMany({});
    
    // Only reset users if --reset argument is passed
    const resetUsers = process.argv.includes('--reset');
    if (resetUsers) {
      await User.deleteMany({});
      console.log('Cleared existing data (including users)');
    } else {
      console.log('Cleared movies only (preserving existing users)');
    }

    // Insert default users only if they don't exist
    const createdUsers = [];
    for (const userData of users) {
      const existingUser = await User.findOne({ username: userData.username });
      if (!existingUser) {
        const user = new User(userData);
        await user.save();
        createdUsers.push(user);
      }
    }
    if (createdUsers.length > 0) {
      console.log(`✓ Inserted ${createdUsers.length} new users`);
    } else {
      console.log('✓ Default users already exist, skipped');
    }
    console.log('  Default credentials:');
    console.log('  Admin - username: admin, password: Admin@123');
    console.log('  Manager - username: manager, password: Manager@123');
    console.log('  User - username: john_doe, password: User@123');

    // Add seats to movies
    const moviesWithSeats = movies.map(movie => ({
      ...movie,
      showtimes: initializeSeats(movie.showtimes)
    }));

    // Insert movies
    const createdMovies = await Movie.insertMany(moviesWithSeats);
    console.log(`✓ Inserted ${createdMovies.length} movies with showtimes and seats`);

    console.log('\n✓ Database seeded successfully!');
    console.log('\nYou can now start the server with: npm start');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run seed
seedDatabase();