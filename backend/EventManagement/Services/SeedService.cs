using EventManagement.Data;
using EventManagement.Models;
using Microsoft.EntityFrameworkCore;

namespace EventManagement.Services;

public static class SeedService
{
    public static async Task SeedDemoDataAsync(AppDbContext db)
    {
        if (await db.Events.AnyAsync()) return;

        var now = DateTime.UtcNow;

        // ── Users ──────────────────────────────────────────────────────────────

        // Organizers
        var alex = new User
        {
            Name         = "Alex Chambers",
            Email        = "alex@demo.eventhub",
            PasswordHash = string.Empty,
            Role         = "Attendee",
            Bio          = "Passionate tech event organiser based in Sydney. Building communities one event at a time.",
            Website      = "https://alexchambers.demo",
            LoyaltyPoints = 4200,
        };
        var priya = new User
        {
            Name         = "Priya Mehta",
            Email        = "priya@demo.eventhub",
            PasswordHash = string.Empty,
            Role         = "Attendee",
            Bio          = "Arts & culture curator. I believe great events change lives — I've been running workshops across Sydney since 2019.",
            Website      = "https://priyamehta.demo",
            LoyaltyPoints = 2800,
        };
        var jordan = new User
        {
            Name         = "Jordan Clarke",
            Email        = "jordan@demo.eventhub",
            PasswordHash = string.Empty,
            Role         = "Attendee",
            Bio          = "Fitness coach and outdoor adventure specialist. If it involves mountains or mud, I'm in.",
            LoyaltyPoints = 1500,
        };

        // Attendees
        var sam = new User
        {
            Name         = "Sam Rivera",
            Email        = "sam@demo.eventhub",
            PasswordHash = string.Empty,
            Role         = "Attendee",
            LoyaltyPoints = 3890,
        };
        var maya = new User
        {
            Name         = "Maya Chen",
            Email        = "maya@demo.eventhub",
            PasswordHash = string.Empty,
            Role         = "Attendee",
            LoyaltyPoints = 2100,
        };
        var luca = new User
        {
            Name         = "Luca Bianchi",
            Email        = "luca@demo.eventhub",
            PasswordHash = string.Empty,
            Role         = "Attendee",
            LoyaltyPoints = 760,
        };
        var anna = new User
        {
            Name         = "Anna Williams",
            Email        = "anna@demo.eventhub",
            PasswordHash = string.Empty,
            Role         = "Attendee",
            LoyaltyPoints = 1340,
        };
        var tom = new User
        {
            Name         = "Tom Hassan",
            Email        = "tom@demo.eventhub",
            PasswordHash = string.Empty,
            Role         = "Attendee",
            LoyaltyPoints = 980,
        };

        db.Users.AddRange(alex, priya, jordan, sam, maya, luca, anna, tom);
        await db.SaveChangesAsync();

        // ── Events ─────────────────────────────────────────────────────────────
        // Category IDs: 1=Conference, 2=Workshop, 3=Concert, 4=Sports, 5=Networking, 6=Other
        // Tag IDs: 1=Music 2=Technology 3=Business 4=Arts 5=Food&Drink 6=Health&Wellness
        //          7=Education 8=Entertainment 9=Gaming 10=Outdoor 11=Charity 12=Family

        var events = new List<Event>
        {
            // ── Upcoming (published) ───────────────────────────────────────────

            // [0] AI Summit — 14 days, 200 cap
            new() {
                Title       = "AI & Machine Learning Summit 2026",
                Description = "Join industry leaders and researchers for a deep dive into the latest advances in artificial intelligence and machine learning. Featuring keynotes, workshops, and networking sessions across two packed days.",
                Location    = "International Convention Centre, Darling Harbour, Sydney NSW 2000",
                StartDate   = now.AddDays(14),
                EndDate     = now.AddDays(15),
                Capacity    = 200,
                Price       = 149m,
                IsPublic    = true,
                Status      = "Published",
                CategoryId  = 1,
                CreatedById = alex.Id,
                ImageUrl    = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80",
            },
            // [1] React Workshop — 7 days, 30 cap (almost full)
            new() {
                Title       = "React Workshop: Advanced Patterns",
                Description = "An intensive hands-on workshop covering advanced React patterns including compound components, render props, custom hooks, and performance optimisation. Bring your laptop — this is a coding day.",
                Location    = "Fishburners, 11 York St, Sydney NSW 2000",
                StartDate   = now.AddDays(7),
                EndDate     = now.AddDays(7).AddHours(8),
                Capacity    = 30,
                Price       = 79m,
                IsPublic    = true,
                Status      = "Published",
                CategoryId  = 2,
                CreatedById = alex.Id,
                ImageUrl    = "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80",
            },
            // [2] Jazz Under the Stars — 21 days, 500 cap
            new() {
                Title       = "Jazz Under the Stars",
                Description = "An unforgettable evening of live jazz performed under the open sky at the Royal Botanic Garden. Bring a picnic rug and enjoy world-class musicians in a magical setting. Free entry — all welcome.",
                Location    = "Royal Botanic Garden, Mrs Macquaries Rd, Sydney NSW 2000",
                StartDate   = now.AddDays(21),
                EndDate     = now.AddDays(21).AddHours(4),
                Capacity    = 500,
                Price       = 0m,
                IsPublic    = true,
                Status      = "Published",
                CategoryId  = 3,
                CreatedById = priya.Id,
                ImageUrl    = "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=800&q=80",
            },
            // [3] Trail Running Camp — 30 days, 50 cap
            new() {
                Title       = "Sydney Trail Running Camp",
                Description = "Three days of guided trail running through the Blue Mountains with expert coaches. Suitable for all levels from beginners to experienced trail runners. Accommodation and meals included in the price.",
                Location    = "Echo Point, Katoomba NSW 2780",
                StartDate   = now.AddDays(30),
                EndDate     = now.AddDays(33),
                Capacity    = 50,
                Price       = 349m,
                IsPublic    = true,
                Status      = "Published",
                CategoryId  = 4,
                CreatedById = jordan.Id,
                ImageUrl    = "https://images.unsplash.com/photo-1483721310020-03333e577078?auto=format&fit=crop&w=800&q=80",
            },
            // [4] Networking Night — 10 days, 100 cap
            new() {
                Title       = "Tech Startup Networking Night",
                Description = "Monthly meetup for founders, engineers, designers and investors in the Sydney tech ecosystem. Grab a drink, meet your next co-founder or collaborator, and hear a short pitch from three local startups. Free to attend.",
                Location    = "The Grounds of Alexandria, 2 Huntley St, Alexandria NSW 2015",
                StartDate   = now.AddDays(10),
                EndDate     = now.AddDays(10).AddHours(3),
                Capacity    = 100,
                Price       = 0m,
                IsPublic    = true,
                Status      = "Published",
                CategoryId  = 5,
                CreatedById = alex.Id,
                ImageUrl    = "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80",
            },
            // [5] Family Fun Day — 45 days, 300 cap
            new() {
                Title       = "Family Fun Day at Centennial Park",
                Description = "A full day of activities for the whole family — bouncy castles, face painting, live music, food stalls and games. Free entry. Rain or shine — covered areas available.",
                Location    = "Centennial Park, Grand Dr, Centennial Park NSW 2021",
                StartDate   = now.AddDays(45),
                EndDate     = now.AddDays(45).AddHours(8),
                Capacity    = 300,
                Price       = 0m,
                IsPublic    = true,
                Status      = "Published",
                CategoryId  = 6,
                CreatedById = priya.Id,
                ImageUrl    = "https://images.unsplash.com/photo-1576502200272-351a6f3d5e1b?auto=format&fit=crop&w=800&q=80",
            },
            // [6] Blockchain Conference — 50 days, 400 cap
            new() {
                Title       = "Blockchain & Web3 Developer Conference",
                Description = "Australia's largest gathering of blockchain developers, DeFi builders and Web3 entrepreneurs. Three tracks covering smart contracts, Layer 2 scaling, NFTs and decentralised identity. Day passes and full conference tickets available.",
                Location    = "Melbourne Convention and Exhibition Centre, 1 Convention Pl, South Wharf VIC 3006",
                StartDate   = now.AddDays(50),
                EndDate     = now.AddDays(51),
                Capacity    = 400,
                Price       = 249m,
                IsPublic    = true,
                Status      = "Published",
                CategoryId  = 1,
                CreatedById = alex.Id,
                ImageUrl    = "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
            },
            // [7] Watercolour Workshop — 18 days, 20 cap (almost full)
            new() {
                Title       = "Watercolour Painting Workshop for Beginners",
                Description = "Learn the fundamentals of watercolour painting in this relaxed, guided workshop. All materials provided. You will leave with two finished paintings and the confidence to keep going. No prior experience needed.",
                Location    = "Carriageworks, 245 Wilson St, Eveleigh NSW 2015",
                StartDate   = now.AddDays(18),
                EndDate     = now.AddDays(18).AddHours(5),
                Capacity    = 20,
                Price       = 89m,
                IsPublic    = true,
                Status      = "Published",
                CategoryId  = 2,
                CreatedById = priya.Id,
                ImageUrl    = "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=800&q=80",
            },
            // [8] Python Bootcamp — 40 days, 30 cap
            new() {
                Title       = "Python Data Science Bootcamp",
                Description = "A weekend deep-dive into data science with Python. Topics include pandas, matplotlib, scikit-learn and a capstone machine learning project. Laptops required. Suitable for intermediate Python developers.",
                Location    = "General Assembly, 1 Margaret St, Sydney NSW 2000",
                StartDate   = now.AddDays(40),
                EndDate     = now.AddDays(41),
                Capacity    = 30,
                Price       = 129m,
                IsPublic    = true,
                Status      = "Published",
                CategoryId  = 2,
                CreatedById = alex.Id,
                ImageUrl    = "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
            },
            // [9] Charity Gala — 60 days, 80 cap
            new() {
                Title       = "Charity Gala Dinner: Support Youth Education",
                Description = "An elegant black-tie gala dinner raising funds for underprivileged youth education programs across regional Australia. Entertainment, silent auction, and a three-course dinner. All proceeds go directly to the cause.",
                Location    = "Sydney Town Hall, 483 George St, Sydney NSW 2000",
                StartDate   = now.AddDays(60),
                EndDate     = now.AddDays(60).AddHours(5),
                Capacity    = 80,
                Price       = 250m,
                IsPublic    = true,
                Status      = "Published",
                CategoryId  = 6,
                CreatedById = priya.Id,
                ImageUrl    = "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80",
            },

            // ── Special states ─────────────────────────────────────────────────

            // [10] Draft
            new() {
                Title       = "Clean Energy Innovation Forum",
                Description = "A gathering of clean energy researchers, engineers and investors discussing the path to net zero. Draft — final agenda still being confirmed.",
                Location    = "CSIRO Discovery, Black Mountain Dr, Canberra ACT 2601",
                StartDate   = now.AddDays(70),
                EndDate     = now.AddDays(71),
                Capacity    = 120,
                Price       = 99m,
                IsPublic    = true,
                Status      = "Draft",
                CategoryId  = 1,
                CreatedById = alex.Id,
                ImageUrl    = "https://images.unsplash.com/photo-1466611653911-0265b6adbb2f?auto=format&fit=crop&w=800&q=80",
            },
            // [11] Cancelled
            new() {
                Title       = "Yoga & Mindfulness Weekend Retreat",
                Description = "A rejuvenating two-day retreat in the Hunter Valley focusing on yoga, breathwork and mindfulness meditation. This event has been cancelled due to venue unavailability.",
                Location    = "Peterson House, Broke Rd, Pokolbin NSW 2320",
                StartDate   = now.AddDays(25),
                EndDate     = now.AddDays(26),
                Capacity    = 60,
                Price       = 299m,
                IsPublic    = true,
                Status      = "Cancelled",
                CategoryId  = 6,
                CreatedById = jordan.Id,
                ImageUrl    = "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80",
            },
            // [12] Postponed
            new() {
                Title       = "JavaScript Full-Stack Bootcamp",
                Description = "An intensive five-day bootcamp covering Node.js, Express, React and PostgreSQL. Build a complete full-stack application from scratch. This event has been rescheduled — see new dates below.",
                Location    = "Coder Academy, 3/9 Barrack St, Sydney NSW 2000",
                StartDate   = now.AddDays(55),
                EndDate     = now.AddDays(59),
                Capacity    = 25,
                Price       = 1299m,
                IsPublic    = true,
                Status      = "Postponed",
                PostponedDate = now.AddDays(15),
                CategoryId  = 2,
                CreatedById = alex.Id,
                ImageUrl    = "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80",
            },
            // [13] Live — started 12h ago, 200 cap
            new() {
                Title       = "DevOps & Cloud Summit 2026",
                Description = "Two-day summit covering Kubernetes, CI/CD pipelines, infrastructure as code and cloud-native architectures. Live now — join us for Day 2 tomorrow.",
                Location    = "Swissotel Sydney, 68 Market St, Sydney NSW 2000",
                StartDate   = now.AddHours(-12),
                EndDate     = now.AddHours(20),
                Capacity    = 200,
                Price       = 129m,
                IsPublic    = true,
                Status      = "Published",
                CategoryId  = 1,
                CreatedById = alex.Id,
                ImageUrl    = "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80",
            },

            // ── Past (completed) ───────────────────────────────────────────────

            // [14] Italian Cooking — -20 days, 15 cap
            new() {
                Title       = "Italian Cooking Masterclass",
                Description = "Learn to make fresh pasta, risotto and tiramisu from scratch with award-winning chef Marco Conti. A hands-on class for food lovers. All ingredients and equipment provided.",
                Location    = "The Essential Ingredient, 731 Bourke St, Surry Hills NSW 2010",
                StartDate   = now.AddDays(-20),
                EndDate     = now.AddDays(-20).AddHours(4),
                Capacity    = 15,
                Price       = 120m,
                IsPublic    = true,
                Status      = "Published",
                CategoryId  = 2,
                CreatedById = priya.Id,
                ImageUrl    = "https://images.unsplash.com/photo-1565299507177-b0ac66763828?auto=format&fit=crop&w=800&q=80",
            },
            // [15] Women in Tech — -35 days, 200 cap
            new() {
                Title       = "Women in Tech Conference Sydney",
                Description = "Annual conference celebrating and connecting women in technology across Australia. Inspiring keynotes, mentorship sessions, and a dedicated job fair. Thank you to all who attended — see you next year!",
                Location    = "Sofitel Sydney Wentworth, 61-101 Phillip St, Sydney NSW 2000",
                StartDate   = now.AddDays(-35),
                EndDate     = now.AddDays(-34),
                Capacity    = 200,
                Price       = 89m,
                IsPublic    = true,
                Status      = "Published",
                CategoryId  = 1,
                CreatedById = alex.Id,
                ImageUrl    = "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80",
            },
            // [16] Photography Walk — -14 days, 20 cap
            new() {
                Title       = "Outdoor Photography Walk: Harbour Bridge",
                Description = "A guided photography walk around the iconic Sydney Harbour Bridge and foreshore at golden hour. Suitable for all camera types including smartphones. Tips on composition, light and post-processing included.",
                Location    = "Milsons Point Station, Kirribilli NSW 2061",
                StartDate   = now.AddDays(-14),
                EndDate     = now.AddDays(-14).AddHours(3),
                Capacity    = 20,
                Price       = 45m,
                IsPublic    = true,
                Status      = "Published",
                CategoryId  = 6,
                CreatedById = priya.Id,
                ImageUrl    = "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=800&q=80",
            },
            // [17] Comedy Night — -7 days, 150 cap
            new() {
                Title       = "Comedy Night: Laugh Out Loud",
                Description = "Three hours of non-stop comedy from five of Australia's best stand-up comedians. Two-drink minimum included in the ticket price. All ages welcome — clean set.",
                Location    = "Sydney Comedy Store, Entertainment Quarter, Moore Park NSW 2021",
                StartDate   = now.AddDays(-7),
                EndDate     = now.AddDays(-7).AddHours(3),
                Capacity    = 150,
                Price       = 35m,
                IsPublic    = true,
                Status      = "Published",
                CategoryId  = 3,
                CreatedById = jordan.Id,
                ImageUrl    = "https://images.unsplash.com/photo-1527224857830-43a7acc85260?auto=format&fit=crop&w=800&q=80",
            },

            // ══════════════════════════════════════════════════════════════════
            // ── Additional events (18–77) ─────────────────────────────────────
            // ══════════════════════════════════════════════════════════════════

            // [18] Sydney Symphony Orchestra
            new() {
                Title       = "Sydney Symphony Orchestra: A Night at the Opera",
                Description = "An enchanting evening with the Sydney Symphony Orchestra performing iconic opera arias and orchestral favourites. Dress to impress and enjoy a pre-show champagne reception in the Grand Foyer.",
                Location    = "Sydney Opera House, Bennelong Point, Sydney NSW 2000",
                StartDate   = now.AddDays(12),
                EndDate     = now.AddDays(12).AddHours(3),
                Capacity    = 2700,
                Price       = 85m,
                IsPublic    = true,
                Status      = "Published",
                CategoryId  = 3,
                CreatedById = priya.Id,
                ImageUrl    = "https://images.unsplash.com/photo-1507838153414-b4b713384a76?auto=format&fit=crop&w=800&q=80",
            },
            // [19] Hackathon
            new() {
                Title       = "Hackathon 2026: Build for Good",
                Description = "A 48-hour hackathon focused on building tech solutions for social impact. Teams of up to four. Prizes for best health, education and sustainability hacks. Mentors from Google, Atlassian and Canva on-site.",
                Location    = "Atlassian HQ, 341 George St, Sydney NSW 2000",
                StartDate   = now.AddDays(22),
                EndDate     = now.AddDays(24),
                Capacity    = 300,
                Price       = 0m,
                IsPublic    = true,
                Status      = "Published",
                CategoryId  = 1,
                CreatedById = alex.Id,
                ImageUrl    = "https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=800&q=80",
            },
            // [20] Meditation & Sound Bath
            new() {
                Title       = "Meditation & Sound Bath Workshop",
                Description = "Immerse yourself in a deep relaxation session guided by certified mindfulness instructors. Himalayan singing bowls, crystal bowls and breathwork will guide you into a state of calm. Mats provided.",
                Location    = "Bondi Pavilion, Queen Elizabeth Dr, Bondi Beach NSW 2026",
                StartDate   = now.AddDays(9),
                EndDate     = now.AddDays(9).AddHours(2),
                Capacity    = 40,
                Price       = 45m,
                IsPublic    = true,
                Status      = "Published",
                CategoryId  = 2,
                CreatedById = jordan.Id,
                ImageUrl    = "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80",
            },
            // [21] Craft Beer Festival
            new() {
                Title       = "Craft Beer & Street Food Festival",
                Description = "Celebrate the best of Australian craft brewing with 40+ independent breweries pouring fresh pints alongside gourmet street food vendors. Live music throughout the day. Bring your friends and your appetite.",
                Location    = "Tumbalong Park, Darling Harbour, Sydney NSW 2000",
                StartDate   = now.AddDays(35),
                EndDate     = now.AddDays(35).AddHours(10),
                Capacity    = 2000,
                Price       = 25m,
                IsPublic    = true,
                Status      = "Published",
                CategoryId  = 6,
                CreatedById = jordan.Id,
                ImageUrl    = "https://images.unsplash.com/photo-1535958636474-b021ee887b13?auto=format&fit=crop&w=800&q=80",
            },
            // [22] Women's Leadership Summit
            new() {
                Title       = "Women's Leadership Summit 2026",
                Description = "A one-day summit bringing together 500 women leaders from across Australia's corporate, government and startup sectors. Workshops on executive presence, negotiation and building your personal brand. Limited tickets.",
                Location    = "Hilton Sydney, 488 George St, Sydney NSW 2000",
                StartDate   = now.AddDays(28),
                EndDate     = now.AddDays(28).AddHours(9),
                Capacity    = 500,
                Price       = 195m,
                IsPublic    = true,
                Status      = "Published",
                CategoryId  = 1,
                CreatedById = priya.Id,
                ImageUrl    = "https://images.unsplash.com/photo-1551836022-4c4c79ecde51?auto=format&fit=crop&w=800&q=80",
            },
            // [23] Street Photography Masterclass
            new() {
                Title       = "Street Photography Masterclass: Finding Stories",
                Description = "Walk Sydney's most photogenic streets with renowned street photographer James Lau. Learn to read light, anticipate moments and develop your visual voice. Bring any camera — phones absolutely welcome.",
                Location    = "Surry Hills, Sydney NSW 2010",
                StartDate   = now.AddDays(16),
                EndDate     = now.AddDays(16).AddHours(4),
                Capacity    = 15,
                Price       = 120m,
                IsPublic    = true,
                Status      = "Published",
                CategoryId  = 2,
                CreatedById = priya.Id,
                ImageUrl    = "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80",
            },
            // [24] Future of EVs
            new() {
                Title       = "Future of Electric Vehicles: Industry Forum",
                Description = "Join engineers, policy makers and fleet managers for a day of panels and demos showcasing EV charging infrastructure, battery technology and the road to net-zero transport across Australia.",
                Location    = "ICC Sydney, 14 Darling Dr, Sydney NSW 2009",
                StartDate   = now.AddDays(42),
                EndDate     = now.AddDays(42).AddHours(8),
                Capacity    = 350,
                Price       = 89m,
                IsPublic    = true,
                Status      = "Published",
                CategoryId  = 1,
                CreatedById = alex.Id,
                ImageUrl    = "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=800&q=80",
            },
            // [25] Hip Hop Dance Workshop
            new() {
                Title       = "Hip Hop Dance Workshop: Foundations",
                Description = "Learn the core elements of hip hop dance — locking, popping and breaking — from professional dancers with international stage credits. Suitable for complete beginners. Sneakers required, no heels.",
                Location    = "Bboy City Studio, 22 Commonwealth St, Surry Hills NSW 2010",
                StartDate   = now.AddDays(11),
                EndDate     = now.AddDays(11).AddHours(3),
                Capacity    = 30,
                Price       = 55m,
                IsPublic    = true,
                Status      = "Published",
                CategoryId  = 2,
                CreatedById = jordan.Id,
                ImageUrl    = "https://images.unsplash.com/photo-1547036967-23d09719813d?auto=format&fit=crop&w=800&q=80",
            },
            // [26] Startup Pitch Night
            new() {
                Title       = "Startup Pitch Night: Season 3",
                Description = "Eight early-stage startups. Three minutes each. One audience vote. Watch this season's cohort pitch live and network with investors and fellow founders over drinks after the show.",
                Location    = "Stone & Chalk, 11 York St, Sydney NSW 2000",
                StartDate   = now.AddDays(6),
                EndDate     = now.AddDays(6).AddHours(3),
                Capacity    = 120,
                Price       = 15m,
                IsPublic    = true,
                Status      = "Published",
                CategoryId  = 5,
                CreatedById = alex.Id,
                ImageUrl    = "https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=800&q=80",
            },
            // [27] Kids Coding Camp
            new() {
                Title       = "Kids Coding Camp: Build Your First Game",
                Description = "A fun-filled weekend camp for kids aged 8–14 to learn programming fundamentals through game development using Scratch and Python. Parents drop off and kids get coding. Snacks provided.",
                Location    = "UNSW Sydney, High St, Kensington NSW 2052",
                StartDate   = now.AddDays(32),
                EndDate     = now.AddDays(33),
                Capacity    = 40,
                Price       = 199m,
                IsPublic    = true,
                Status      = "Published",
                CategoryId  = 2,
                CreatedById = alex.Id,
                ImageUrl    = "https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=800&q=80",
            },
            // [28] Wine & Cheese Tasting
            new() {
                Title       = "Wine & Cheese Tasting Evening",
                Description = "Explore eight boutique Hunter Valley wines expertly paired with artisan Australian cheeses, guided by a certified sommelier. Limited to 30 guests for an intimate experience. Glass and board included.",
                Location    = "The Wine Library, 18 Oxford St, Paddington NSW 2021",
                StartDate   = now.AddDays(20),
                EndDate     = now.AddDays(20).AddHours(3),
                Capacity    = 30,
                Price       = 95m,
                IsPublic    = true,
                Status      = "Published",
                CategoryId  = 6,
                CreatedById = priya.Id,
                ImageUrl    = "https://images.unsplash.com/photo-1510624153851-2ead6952a6a2?auto=format&fit=crop&w=800&q=80",
            },
            // [29] Rock Climbing for Beginners
            new() {
                Title       = "Rock Climbing for Beginners",
                Description = "Never climbed before? Our certified instructors will teach you the fundamentals of top-rope climbing in a safe, supportive environment. All gear provided. Suitable for ages 14+.",
                Location    = "Climb Fit Villawood, 19 Homestead Rd, Villawood NSW 2163",
                StartDate   = now.AddDays(13),
                EndDate     = now.AddDays(13).AddHours(3),
                Capacity    = 20,
                Price       = 65m,
                IsPublic    = true,
                Status      = "Published",
                CategoryId  = 4,
                CreatedById = jordan.Id,
                ImageUrl    = "https://images.unsplash.com/photo-1522163723536-33f74a5a06b4?auto=format&fit=crop&w=800&q=80",
            },
            // [30] UX/UI Design Sprint
            new() {
                Title       = "UX/UI Design Sprint: From Problem to Prototype",
                Description = "A full-day design sprint workshop where you'll learn Google Ventures' five-day sprint methodology compressed into eight intense hours. Tackle a real product challenge and leave with a testable prototype.",
                Location    = "Canva HQ, 110 Kippax St, Surry Hills NSW 2010",
                StartDate   = now.AddDays(26),
                EndDate     = now.AddDays(26).AddHours(8),
                Capacity    = 25,
                Price       = 149m,
                IsPublic    = true,
                Status      = "Published",
                CategoryId  = 2,
                CreatedById = alex.Id,
                ImageUrl    = "https://images.unsplash.com/photo-1561214115-f2f134cc4912?auto=format&fit=crop&w=800&q=80",
            },
            // [31] Charity Golf Tournament
            new() {
                Title       = "Golf Tournament: Charity Cup 2026",
                Description = "An 18-hole ambrose golf day raising funds for Beyond Blue. All handicap levels welcome. Includes cart hire, lunch and a gala dinner. Prizes for longest drive, nearest pin and overall team score.",
                Location    = "New South Wales Golf Club, Henry Head, La Perouse NSW 2036",
                StartDate   = now.AddDays(48),
                EndDate     = now.AddDays(48).AddHours(10),
                Capacity    = 80,
                Price       = 180m,
                IsPublic    = true,
                Status      = "Published",
                CategoryId  = 4,
                CreatedById = jordan.Id,
                ImageUrl    = "https://images.unsplash.com/photo-1535131323-2d4a0c9e6b1e?auto=format&fit=crop&w=800&q=80",
            },
            // [32] Sushi Making Class
            new() {
                Title       = "Sushi Making Masterclass",
                Description = "Learn the art of Japanese sushi from a trained sushi chef. Roll maki, shape nigiri and assemble a stunning platter to take home. All ingredients included. Sake tasting optional add-on available.",
                Location    = "Sokyo, The Star, 80 Pyrmont St, Pyrmont NSW 2009",
                StartDate   = now.AddDays(17),
                EndDate     = now.AddDays(17).AddHours(3),
                Capacity    = 18,
                Price       = 110m,
                IsPublic    = true,
                Status      = "Published",
                CategoryId  = 2,
                CreatedById = priya.Id,
                ImageUrl    = "https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=800&q=80",
            },
            // [33] Mountain Bike Race
            new() {
                Title       = "Blue Mountains Cross Country MTB Race",
                Description = "A 40km cross-country mountain bike race through technical singletrack in the Blue Mountains National Park. Open, Sport and Expert categories. Timed chip, medal and post-race BBQ included.",
                Location    = "Woodford, Blue Mountains NSW 2778",
                StartDate   = now.AddDays(37),
                EndDate     = now.AddDays(37).AddHours(8),
                Capacity    = 200,
                Price       = 75m,
                IsPublic    = true,
                Status      = "Published",
                CategoryId  = 4,
                CreatedById = jordan.Id,
                ImageUrl    = "https://images.unsplash.com/photo-1571333250630-f0230c61d37e?auto=format&fit=crop&w=800&q=80",
            },
            // [34] Aerial Yoga
            new() {
                Title       = "Aerial Yoga Experience: Beginners Welcome",
                Description = "Discover the joy of yoga in a hammock — decompressing the spine, building core strength and finishing in a blissful silk cocoon savasana. No previous yoga experience required. All hammock equipment provided.",
                Location    = "One Hot Yoga, 151 Castlereagh St, Sydney NSW 2000",
                StartDate   = now.AddDays(8),
                EndDate     = now.AddDays(8).AddHours(2),
                Capacity    = 16,
                Price       = 50m,
                IsPublic    = true,
                Status      = "Published",
                CategoryId  = 2,
                CreatedById = jordan.Id,
                ImageUrl    = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80",
            },
            // [35] Board Game Night
            new() {
                Title       = "Board Game Night: Mega Edition",
                Description = "Over 500 games, unlimited play time and a venue full of fellow enthusiasts. From gateway games to heavy euros — our hosts will help you find the perfect match for your group. Snacks available at the bar.",
                Location    = "Meeples Board Game Cafe, 200 Commonwealth St, Surry Hills NSW 2010",
                StartDate   = now.AddDays(5),
                EndDate     = now.AddDays(5).AddHours(5),
                Capacity    = 80,
                Price       = 20m,
                IsPublic    = true,
                Status      = "Published",
                CategoryId  = 6,
                CreatedById = priya.Id,
                ImageUrl    = "https://images.unsplash.com/photo-1611996575749-79a78f1e3fe4?auto=format&fit=crop&w=800&q=80",
            },
            // [36] Finance Workshop
            new() {
                Title       = "Personal Finance & Investing for Beginners",
                Description = "Take control of your money. This workshop covers budgeting frameworks, index fund investing, superannuation optimisation and property vs shares. No financial jargon — plain-English explanations throughout.",
                Location    = "WeWork, 333 George St, Sydney NSW 2000",
                StartDate   = now.AddDays(15),
                EndDate     = now.AddDays(15).AddHours(4),
                Capacity    = 60,
                Price       = 49m,
                IsPublic    = true,
                Status      = "Published",
                CategoryId  = 2,
                CreatedById = alex.Id,
                ImageUrl    = "https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?auto=format&fit=crop&w=800&q=80",
            },
            // [37] Street Food Festival
            new() {
                Title       = "Street Food & Culture Festival",
                Description = "Sixty food vendors representing 25 cuisines set up along a closed Oxford Street. Live cooking demos, a chilli eating competition and cultural performances throughout the day. Entry is free.",
                Location    = "Oxford Street, Darlinghurst NSW 2010",
                StartDate   = now.AddDays(53),
                EndDate     = now.AddDays(53).AddHours(10),
                Capacity    = 5000,
                Price       = 0m,
                IsPublic    = true,
                Status      = "Published",
                CategoryId  = 6,
                CreatedById = priya.Id,
                ImageUrl    = "https://images.unsplash.com/photo-1519984388953-d2406bc725e1?auto=format&fit=crop&w=800&q=80",
            },
            // [38] VR Gaming Expo
            new() {
                Title       = "Virtual Reality Gaming Expo",
                Description = "Try 30+ VR experiences from indie developers and AAA studios. Demo unreleased titles, compete in VR esports tournaments and meet the developers behind the headsets. Open to all ages.",
                Location    = "Royal Hall of Industries, Moore Park NSW 2021",
                StartDate   = now.AddDays(44),
                EndDate     = now.AddDays(45),
                Capacity    = 1500,
                Price       = 35m,
                IsPublic    = true,
                Status      = "Published",
                CategoryId  = 6,
                CreatedById = alex.Id,
                ImageUrl    = "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&w=800&q=80",
            },
            // [39] Sustainable Fashion Show
            new() {
                Title       = "Sustainable Fashion Show: Future Threads",
                Description = "A runway showcase featuring ten emerging Australian designers committed to ethical production and sustainable materials. Panel discussion on circular fashion follows the show. Champagne on arrival.",
                Location    = "Carriageworks, 245 Wilson St, Eveleigh NSW 2015",
                StartDate   = now.AddDays(39),
                EndDate     = now.AddDays(39).AddHours(4),
                Capacity    = 300,
                Price       = 55m,
                IsPublic    = true,
                Status      = "Published",
                CategoryId  = 6,
                CreatedById = priya.Id,
                ImageUrl    = "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=80",
            },
            // [40] Corporate Leadership Retreat
            new() {
                Title       = "Corporate Leadership Retreat: Lead with Impact",
                Description = "A two-day residential retreat for senior leaders covering adaptive leadership, psychological safety and high-performance team dynamics. Facilitated by ex-Google and McKinsey coaches.",
                Location    = "Emirates One&Only Wolgan Valley, Wolgan Valley NSW 2790",
                StartDate   = now.AddDays(56),
                EndDate     = now.AddDays(57),
                Capacity    = 30,
                Price       = 2500m,
                IsPublic    = true,
                Status      = "Published",
                CategoryId  = 2,
                CreatedById = alex.Id,
                ImageUrl    = "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=800&q=80",
            },
            // [41] Marathon Training Bootcamp
            new() {
                Title       = "Marathon Training Bootcamp: 8-Week Launch",
                Description = "Kick off your marathon journey with this weekend bootcamp. Expert coaches build your base, teach proper running form and give you a personalised 18-week training plan. Suitable for first-time marathon runners.",
                Location    = "Centennial Park, Grand Dr, Centennial Park NSW 2021",
                StartDate   = now.AddDays(19),
                EndDate     = now.AddDays(19).AddHours(6),
                Capacity    = 50,
                Price       = 99m,
                IsPublic    = true,
                Status      = "Published",
                CategoryId  = 4,
                CreatedById = jordan.Id,
                ImageUrl    = "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80",
            },
            // [42] JavaScript for Beginners
            new() {
                Title       = "JavaScript for Absolute Beginners",
                Description = "Zero to functioning web developer in one weekend. Build three real projects — a to-do app, a weather widget and a quiz game. Exercises, slides and lifetime access to the course repo included.",
                Location    = "General Assembly, 1 Margaret St, Sydney NSW 2000",
                StartDate   = now.AddDays(27),
                EndDate     = now.AddDays(28),
                Capacity    = 25,
                Price       = 249m,
                IsPublic    = true,
                Status      = "Published",
                CategoryId  = 2,
                CreatedById = alex.Id,
                ImageUrl    = "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80",
            },
            // [43] Live Painting Performance
            new() {
                Title       = "Live Painting Performance & Art Auction",
                Description = "Watch five artists create large-format paintings from scratch over four hours of live performance, then bid on the finished works in a charity auction. Drinks and canapes included. Proceeds to children's art programs.",
                Location    = "4A Centre for Contemporary Asian Art, 181-187 Chalmers St, Surry Hills NSW 2010",
                StartDate   = now.AddDays(23),
                EndDate     = now.AddDays(23).AddHours(5),
                Capacity    = 120,
                Price       = 40m,
                IsPublic    = true,
                Status      = "Published",
                CategoryId  = 6,
                CreatedById = priya.Id,
                ImageUrl    = "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80",
            },
            // [44] Fermentation Workshop
            new() {
                Title       = "Fermentation Workshop: Kombucha & Kimchi",
                Description = "Discover the world of beneficial fermentation. Make your own SCOBY kombucha to take home, learn traditional kimchi preparation and taste a range of fermented foods. Jars, cultures and all ingredients provided.",
                Location    = "Sydney Cooking School, 2/807 Pacific Hwy, Chatswood NSW 2067",
                StartDate   = now.AddDays(31),
                EndDate     = now.AddDays(31).AddHours(4),
                Capacity    = 20,
                Price       = 85m,
                IsPublic    = true,
                Status      = "Published",
                CategoryId  = 2,
                CreatedById = priya.Id,
                ImageUrl    = "https://images.unsplash.com/photo-1488459716781-31db52582fe5?auto=format&fit=crop&w=800&q=80",
            },
            // [45] Outdoor Cinema
            new() {
                Title       = "Outdoor Cinema Under the Stars",
                Description = "Classic films screened under the night sky at the Royal Botanic Garden. Bring your own picnic or grab food from our on-site vendors. Tonight's film announced on the day. Gates open 6pm, film at sunset.",
                Location    = "Royal Botanic Garden, Mrs Macquaries Rd, Sydney NSW 2000",
                StartDate   = now.AddDays(4),
                EndDate     = now.AddDays(4).AddHours(4),
                Capacity    = 400,
                Price       = 18m,
                IsPublic    = true,
                Status      = "Published",
                CategoryId  = 6,
                CreatedById = jordan.Id,
                ImageUrl    = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80",
            },
            // [46] Cybersecurity Conference
            new() {
                Title       = "Cybersecurity & Ethical Hacking Conference 2026",
                Description = "Australia's premier cybersecurity event. CTF competitions, red-team demonstrations, zero-day disclosure talks and vendor expo. CPD points available for certified professionals. Three tracks across two days.",
                Location    = "Doltone House, 181 Elizabeth St, Sydney NSW 2000",
                StartDate   = now.AddDays(62),
                EndDate     = now.AddDays(63),
                Capacity    = 600,
                Price       = 299m,
                IsPublic    = true,
                Status      = "Published",
                CategoryId  = 1,
                CreatedById = alex.Id,
                ImageUrl    = "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=800&q=80",
            },
            // [47] Salsa Night
            new() {
                Title       = "Salsa & Latin Dance Night",
                Description = "Kick off the weekend with a beginner salsa lesson at 7pm followed by two hours of open social dancing to live Latin music. All ages and experience levels welcome — just bring good shoes and great energy.",
                Location    = "La Salsa Dance Studio, 290 Crown St, Surry Hills NSW 2010",
                StartDate   = now.AddDays(3),
                EndDate     = now.AddDays(3).AddHours(4),
                Capacity    = 100,
                Price       = 20m,
                IsPublic    = true,
                Status      = "Published",
                CategoryId  = 6,
                CreatedById = priya.Id,
                ImageUrl    = "https://images.unsplash.com/photo-1547036967-23d09719813d?auto=format&fit=crop&w=800&q=80",
            },
            // [48] Product Management Workshop
            new() {
                Title       = "Product Management Intensive: Ship Better Products",
                Description = "A one-day workshop for PMs and aspiring product managers. Covers customer discovery, writing effective PRDs, roadmap prioritisation and stakeholder management. Taught by product leads from Atlassian and Canva.",
                Location    = "Fishburners, 11 York St, Sydney NSW 2000",
                StartDate   = now.AddDays(34),
                EndDate     = now.AddDays(34).AddHours(8),
                Capacity    = 35,
                Price       = 279m,
                IsPublic    = true,
                Status      = "Published",
                CategoryId  = 2,
                CreatedById = alex.Id,
                ImageUrl    = "https://images.unsplash.com/photo-1504805572947-34fad45b2eda?auto=format&fit=crop&w=800&q=80",
            },
            // [49] Night Photography Workshop
            new() {
                Title       = "Night Photography: City Lights Workshop",
                Description = "Master long exposure, light trails, star photography and cityscapes after dark. Tripods provided. We'll shoot from six iconic Sydney locations over four hours. Editing tips included. DSLR or mirrorless required.",
                Location    = "Circular Quay, Sydney NSW 2000",
                StartDate   = now.AddDays(24),
                EndDate     = now.AddDays(24).AddHours(4),
                Capacity    = 12,
                Price       = 135m,
                IsPublic    = true,
                Status      = "Published",
                CategoryId  = 2,
                CreatedById = priya.Id,
                ImageUrl    = "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=800&q=80",
            },
            // [50] Charity Fun Run
            new() {
                Title       = "Charity Fun Run 5K: Run for a Reason",
                Description = "A timed 5K fun run through Centennial Park raising money for the Children's Cancer Institute. Costumes encouraged. Finisher medal, banana and water station included. Family-friendly — strollers and dogs welcome.",
                Location    = "Centennial Park, Grand Dr, Centennial Park NSW 2021",
                StartDate   = now.AddDays(29),
                EndDate     = now.AddDays(29).AddHours(3),
                Capacity    = 1000,
                Price       = 30m,
                IsPublic    = true,
                Status      = "Published",
                CategoryId  = 4,
                CreatedById = jordan.Id,
                ImageUrl    = "https://images.unsplash.com/photo-1452626212852-811d58933cae?auto=format&fit=crop&w=800&q=80",
            },
            // [51] Science & Innovation Fair
            new() {
                Title       = "Science & Innovation Fair 2026",
                Description = "A public festival of science featuring live experiments, robotics demos, space exploration exhibits and talks from CSIRO and university researchers. Free for all ages. Perfect for curious minds of every generation.",
                Location    = "Australian Museum, 1 William St, Sydney NSW 2010",
                StartDate   = now.AddDays(58),
                EndDate     = now.AddDays(59),
                Capacity    = 2000,
                Price       = 0m,
                IsPublic    = true,
                Status      = "Published",
                CategoryId  = 1,
                CreatedById = alex.Id,
                ImageUrl    = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
            },
            // [52] Stand-Up Comedy Open Mic
            new() {
                Title       = "Stand-Up Comedy Open Mic Night",
                Description = "Twenty-four comedians get five minutes each. Some will kill, some will bomb — all of it will be entertaining. Your support means the world to the next generation of Australian comedy talent. Two-drink minimum.",
                Location    = "Lazy Bones Lounge, 294 Marrickville Rd, Marrickville NSW 2204",
                StartDate   = now.AddDays(2),
                EndDate     = now.AddDays(2).AddHours(3),
                Capacity    = 80,
                Price       = 10m,
                IsPublic    = true,
                Status      = "Published",
                CategoryId  = 6,
                CreatedById = jordan.Id,
                ImageUrl    = "https://images.unsplash.com/photo-1527224857830-43a7acc85260?auto=format&fit=crop&w=800&q=80",
            },
            // [53] Aqua Yoga
            new() {
                Title       = "Aqua Yoga Sunrise Session",
                Description = "Start your day with a magical sunrise yoga session on a paddleboard or in the shallows of Manly Beach. Suitable for beginner swimmers. Boards provided. Towel and water shoes recommended.",
                Location    = "Manly Beach, North Steyne, Manly NSW 2095",
                StartDate   = now.AddDays(7).AddHours(-3),
                EndDate     = now.AddDays(7).AddHours(-1),
                Capacity    = 20,
                Price       = 40m,
                IsPublic    = true,
                Status      = "Published",
                CategoryId  = 4,
                CreatedById = jordan.Id,
                ImageUrl    = "https://images.unsplash.com/photo-1530549387789-4c059dc2cdd0?auto=format&fit=crop&w=800&q=80",
            },
            // [54] Cloud & Kubernetes Bootcamp
            new() {
                Title       = "Cloud & Kubernetes Certification Bootcamp",
                Description = "Intensive two-day prep course for the Certified Kubernetes Administrator (CKA) exam. Hands-on labs on EKS, GKE and AKS. Practice exams included. Pass rate over 90% for our graduates.",
                Location    = "ATC, Level 6, 500 Collins St, Melbourne VIC 3000",
                StartDate   = now.AddDays(46),
                EndDate     = now.AddDays(47),
                Capacity    = 20,
                Price       = 899m,
                IsPublic    = true,
                Status      = "Published",
                CategoryId  = 2,
                CreatedById = alex.Id,
                ImageUrl    = "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
            },
            // [55] Gourmet Pizza Night
            new() {
                Title       = "Gourmet Pizza & Pasta Night",
                Description = "Roll, stretch and top your own pizza dough using traditional Neapolitan techniques, then finish the evening making a fresh cacio e pepe pasta. Wood-fired oven on site. Wine pairing available as an add-on.",
                Location    = "Via Napoli Cucina e Cantina, 4 Macquarie St, Sydney NSW 2000",
                StartDate   = now.AddDays(36),
                EndDate     = now.AddDays(36).AddHours(4),
                Capacity    = 16,
                Price       = 105m,
                IsPublic    = true,
                Status      = "Published",
                CategoryId  = 2,
                CreatedById = priya.Id,
                ImageUrl    = "https://images.unsplash.com/photo-1565299624946-b28f40a04ae4?auto=format&fit=crop&w=800&q=80",
            },
            // [56] Triathlon Training Weekend
            new() {
                Title       = "Triathlon Training Weekend",
                Description = "A coach-led training weekend for aspiring and intermediate triathletes covering open-water swimming technique, cycling power output and brick sessions. Suitable for Olympic and Half Ironman distances.",
                Location    = "Penrith Whitewater Stadium, Penrith NSW 2750",
                StartDate   = now.AddDays(41),
                EndDate     = now.AddDays(42),
                Capacity    = 30,
                Price       = 295m,
                IsPublic    = true,
                Status      = "Published",
                CategoryId  = 4,
                CreatedById = jordan.Id,
                ImageUrl    = "https://images.unsplash.com/photo-1530549387789-4c059dc2cdd0?auto=format&fit=crop&w=800&q=80",
            },
            // [57] Illustration & Digital Art
            new() {
                Title       = "Illustration & Digital Art Workshop",
                Description = "Learn to create stunning digital illustrations using Procreate and Adobe Fresco. Covers character design, colour theory and building a social media portfolio. iPads provided or bring your own. All skill levels welcome.",
                Location    = "Katarzyna Kowalski Studio, 66 King St, Newtown NSW 2042",
                StartDate   = now.AddDays(25),
                EndDate     = now.AddDays(25).AddHours(6),
                Capacity    = 18,
                Price       = 130m,
                IsPublic    = true,
                Status      = "Published",
                CategoryId  = 2,
                CreatedById = priya.Id,
                ImageUrl    = "https://images.unsplash.com/photo-1561214115-f2f134cc4912?auto=format&fit=crop&w=800&q=80",
            },
            // [58] Entrepreneurs Breakfast
            new() {
                Title       = "Entrepreneurs' Breakfast Club: March Edition",
                Description = "Crack of dawn networking for founders and early-stage operators. Two featured speaker slots, open table discussion and warm croissants. Grow your network before the rest of the city wakes up.",
                Location    = "Café Sopra, 7 Danks St, Waterloo NSW 2017",
                StartDate   = now.AddDays(4).AddHours(-6),
                EndDate     = now.AddDays(4).AddHours(-4),
                Capacity    = 40,
                Price       = 15m,
                IsPublic    = true,
                Status      = "Published",
                CategoryId  = 5,
                CreatedById = alex.Id,
                ImageUrl    = "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=800&q=80",
            },
            // [59] Astronomy Night
            new() {
                Title       = "Astronomy Night: Milky Way Gazing",
                Description = "Escape the city and gaze at the southern sky with expert astronomers. 12-inch Dobsonian and 8-inch refractor telescopes set up for viewing. Covers constellations, planets and deep sky objects. Light pollution free site.",
                Location    = "Mudgee Dark Sky Reserve, Mudgee NSW 2850",
                StartDate   = now.AddDays(33),
                EndDate     = now.AddDays(33).AddHours(5),
                Capacity    = 40,
                Price       = 60m,
                IsPublic    = true,
                Status      = "Published",
                CategoryId  = 6,
                CreatedById = alex.Id,
                ImageUrl    = "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=800&q=80",
            },
            // [60] Chess Tournament
            new() {
                Title       = "City Chess Championship 2026",
                Description = "A rated 7-round Swiss chess tournament open to all players with an official rating or who have played in a previous club event. Prizes for open, under-1600 and junior divisions. FIDE-rated.",
                Location    = "Sydney Chess Club, Level 1, 70 Pitt St, Sydney NSW 2000",
                StartDate   = now.AddDays(38),
                EndDate     = now.AddDays(38).AddHours(9),
                Capacity    = 64,
                Price       = 25m,
                IsPublic    = true,
                Status      = "Published",
                CategoryId  = 6,
                CreatedById = priya.Id,
                ImageUrl    = "https://images.unsplash.com/photo-1529699310412-da8dfddb5bbf?auto=format&fit=crop&w=800&q=80",
            },
            // [61] Sustainable Living Expo
            new() {
                Title       = "Sustainable Living Expo 2026",
                Description = "Three halls of exhibitors, talks and workshops covering zero-waste living, regenerative agriculture, green home technology and ethical consumerism. Enter for free and leave inspired to live more sustainably.",
                Location    = "Sydney Showground, 1 Showground Rd, Sydney Olympic Park NSW 2127",
                StartDate   = now.AddDays(65),
                EndDate     = now.AddDays(66),
                Capacity    = 8000,
                Price       = 0m,
                IsPublic    = true,
                Status      = "Published",
                CategoryId  = 1,
                CreatedById = alex.Id,
                ImageUrl    = "https://images.unsplash.com/photo-1466611653911-0265b6adbb2f?auto=format&fit=crop&w=800&q=80",
            },
            // [62] Irish Folk Music
            new() {
                Title       = "Irish Folk Music Evening",
                Description = "A rousing night of traditional Irish music performed by the Clancy's Creek ensemble — fiddles, tin whistles, bodhrán and booming vocals. Settle in with a Guinness and let the craic begin.",
                Location    = "The Rocks, Sydney NSW 2000",
                StartDate   = now.AddDays(9).AddHours(4),
                EndDate     = now.AddDays(9).AddHours(7),
                Capacity    = 200,
                Price       = 30m,
                IsPublic    = true,
                Status      = "Published",
                CategoryId  = 3,
                CreatedById = jordan.Id,
                ImageUrl    = "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=800&q=80",
            },
            // [63] Escape Room
            new() {
                Title       = "Escape Room: Midnight Thriller",
                Description = "Groups of 3–6 players. You have 60 minutes to escape a locked study, solve cryptic clues and unravel the mystery of the vanished professor. Designed for beginners and escape room veterans alike. Scary-lite.",
                Location    = "Escape Hunt Sydney, 56 Clarence St, Sydney NSW 2000",
                StartDate   = now.AddDays(3).AddHours(3),
                EndDate     = now.AddDays(3).AddHours(4),
                Capacity    = 30,
                Price       = 38m,
                IsPublic    = true,
                Status      = "Published",
                CategoryId  = 6,
                CreatedById = jordan.Id,
                ImageUrl    = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80",
            },
            // [64] Creative Writing Masterclass
            new() {
                Title       = "Creative Writing Masterclass: Unlock Your Voice",
                Description = "Acclaimed novelist Harriet Owens leads a full-day intensive in short fiction craft — opening hooks, scene construction, dialogue and editing your own draft. Bring 500 words of your current work for feedback.",
                Location    = "NSW Writers Centre, Callan Park, Rozelle NSW 2039",
                StartDate   = now.AddDays(43),
                EndDate     = now.AddDays(43).AddHours(7),
                Capacity    = 20,
                Price       = 165m,
                IsPublic    = true,
                Status      = "Published",
                CategoryId  = 2,
                CreatedById = priya.Id,
                ImageUrl    = "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80",
            },
            // [65] Asian Street Food Festival
            new() {
                Title       = "Asian Street Food Festival",
                Description = "A celebration of Asian culinary heritage with 50 vendors serving authentic dishes from Japan, Korea, Thailand, Vietnam, India and the Philippines. Live cooking demos by celebrated chefs. Free to enter.",
                Location    = "Pyrmont Bay Park, Pyrmont NSW 2009",
                StartDate   = now.AddDays(47),
                EndDate     = now.AddDays(48),
                Capacity    = 10000,
                Price       = 0m,
                IsPublic    = true,
                Status      = "Published",
                CategoryId  = 6,
                CreatedById = priya.Id,
                ImageUrl    = "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?auto=format&fit=crop&w=800&q=80",
            },
            // [66] Electric Music Festival
            new() {
                Title       = "Electric Music & Arts Festival",
                Description = "A two-day electronic music festival with five stages, 40 artists and an immersive art installation zone. From ambient and downtempo to hard techno and drum & bass. Camping available on site. 18+ event.",
                Location    = "Eastern Creek Raceway, Eastern Creek NSW 2766",
                StartDate   = now.AddDays(52),
                EndDate     = now.AddDays(53),
                Capacity    = 15000,
                Price       = 195m,
                IsPublic    = true,
                Status      = "Published",
                CategoryId  = 3,
                CreatedById = jordan.Id,
                ImageUrl    = "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?auto=format&fit=crop&w=800&q=80",
            },
            // [67] Mental Health First Aid
            new() {
                Title       = "Mental Health First Aid Training",
                Description = "Become a certified Mental Health First Aider. This two-day Accredited Standard MHFA course teaches you to recognise and respond to mental health crises in the workplace and community. Certificate issued on completion.",
                Location    = "St Vincent's Hospital, 390 Victoria St, Darlinghurst NSW 2010",
                StartDate   = now.AddDays(43),
                EndDate     = now.AddDays(44),
                Capacity    = 20,
                Price       = 200m,
                IsPublic    = true,
                Status      = "Published",
                CategoryId  = 2,
                CreatedById = priya.Id,
                ImageUrl    = "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80",
            },
            // [68] Open Water Swimming
            new() {
                Title       = "Open Water Swimming Championship",
                Description = "A 2.5km ocean swim from Manly to Shelly Beach. Ages 16+. Timed event, medals for podium finishers in each age group. Safety kayakers throughout. Wetsuits allowed but not required.",
                Location    = "Manly Beach, North Steyne, Manly NSW 2095",
                StartDate   = now.AddDays(36).AddHours(2),
                EndDate     = now.AddDays(36).AddHours(5),
                Capacity    = 500,
                Price       = 55m,
                IsPublic    = true,
                Status      = "Published",
                CategoryId  = 4,
                CreatedById = jordan.Id,
                ImageUrl    = "https://images.unsplash.com/photo-1530549387789-4c059dc2cdd0?auto=format&fit=crop&w=800&q=80",
            },
            // [69] Architecture Walking Tour
            new() {
                Title       = "Sydney Architectural Walking Tour",
                Description = "A two-hour guided walk through the CBD with a registered architect uncovering the stories behind Sydney's most iconic and overlooked buildings — from colonial sandstone to postmodern towers and contemporary masterpieces.",
                Location    = "Martin Place, Sydney NSW 2000",
                StartDate   = now.AddDays(15).AddHours(2),
                EndDate     = now.AddDays(15).AddHours(4),
                Capacity    = 25,
                Price       = 35m,
                IsPublic    = true,
                Status      = "Published",
                CategoryId  = 6,
                CreatedById = priya.Id,
                ImageUrl    = "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=800&q=80",
            },
            // [70] Korean BBQ Night
            new() {
                Title       = "Korean BBQ & Culture Night",
                Description = "More than a meal — an experience. Grill wagyu beef, pork belly and marinated chicken over charcoal at your own table, guided by our hosts. K-pop performances, soju tasting and traditional games round out the evening.",
                Location    = "Barangaroo Reserve, Hickson Rd, Barangaroo NSW 2000",
                StartDate   = now.AddDays(22).AddHours(5),
                EndDate     = now.AddDays(22).AddHours(9),
                Capacity    = 150,
                Price       = 75m,
                IsPublic    = true,
                Status      = "Published",
                CategoryId  = 6,
                CreatedById = priya.Id,
                ImageUrl    = "https://images.unsplash.com/photo-1546069901-5ec6a79120b0?auto=format&fit=crop&w=800&q=80",
            },
            // [71] Emerging Artists Showcase
            new() {
                Title       = "Emerging Artists Showcase: New Voices",
                Description = "A one-night gallery opening featuring 18 emerging visual artists from the National Art School's graduating class of 2025. Paintings, sculpture, digital works and video art. Meet the artists. Works available for purchase.",
                Location    = "National Art School Gallery, Forbes St, Darlinghurst NSW 2010",
                StartDate   = now.AddDays(18).AddHours(5),
                EndDate     = now.AddDays(18).AddHours(9),
                Capacity    = 200,
                Price       = 0m,
                IsPublic    = true,
                Status      = "Published",
                CategoryId  = 6,
                CreatedById = priya.Id,
                ImageUrl    = "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80",
            },
            // [72] Podcast Production Workshop
            new() {
                Title       = "Podcast Recording & Production Workshop",
                Description = "From concept to published episode in one day. Learn microphone technique, DAW basics in Reaper/Audition, storytelling structure and how to grow an audience. Each attendee records a pilot episode to take home.",
                Location    = "Loud & Clear Studios, 160 King St, Newtown NSW 2042",
                StartDate   = now.AddDays(31).AddHours(1),
                EndDate     = now.AddDays(31).AddHours(8),
                Capacity    = 12,
                Price       = 195m,
                IsPublic    = true,
                Status      = "Published",
                CategoryId  = 2,
                CreatedById = alex.Id,
                ImageUrl    = "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=800&q=80",
            },
            // [73] Bouldering Competition
            new() {
                Title       = "Bouldering Competition: The Bloc Open",
                Description = "Open-format bouldering comp across 30 new problems set for the occasion. All grades from V0 to V10+. Score your best 6 sends in 3 hours. Beginner, intermediate and open categories. Registration closes day before.",
                Location    = "Blochouse, 9 Lackey St, St Peters NSW 2044",
                StartDate   = now.AddDays(20).AddHours(3),
                EndDate     = now.AddDays(20).AddHours(9),
                Capacity    = 80,
                Price       = 30m,
                IsPublic    = true,
                Status      = "Published",
                CategoryId  = 4,
                CreatedById = jordan.Id,
                ImageUrl    = "https://images.unsplash.com/photo-1522163723536-33f74a5a06b4?auto=format&fit=crop&w=800&q=80",
            },
            // [74] Indigenous Art Exhibition
            new() {
                Title       = "Indigenous Art & Culture Exhibition: Country",
                Description = "A two-week exhibition celebrating First Nations art from across Australia, from Western Desert dot paintings to contemporary urban works. Guided tours Thursday evenings. Proceeds support Indigenous artist communities.",
                Location    = "Art Gallery of NSW, Art Gallery Rd, The Domain, Sydney NSW 2000",
                StartDate   = now.AddDays(14).AddHours(5),
                EndDate     = now.AddDays(28).AddHours(5),
                Capacity    = 1000,
                Price       = 0m,
                IsPublic    = true,
                Status      = "Published",
                CategoryId  = 6,
                CreatedById = priya.Id,
                ImageUrl    = "https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=800&q=80",
            },
            // [75] Kids Science Camp
            new() {
                Title       = "Kids Science & Nature Camp",
                Description = "A three-day outdoor science camp for ages 7–12. Kids explore ecosystems, build rockets, conduct chemistry experiments and learn to identify native birds and plants. Qualified educators and scientists on site.",
                Location    = "Lane Cove National Park, Lane Cove NSW 2066",
                StartDate   = now.AddDays(61),
                EndDate     = now.AddDays(63),
                Capacity    = 50,
                Price       = 395m,
                IsPublic    = true,
                Status      = "Published",
                CategoryId  = 6,
                CreatedById = alex.Id,
                ImageUrl    = "https://images.unsplash.com/photo-1576502200272-351a6f3d5e1b?auto=format&fit=crop&w=800&q=80",
            },
            // [76] Rooftop Networking Melbourne
            new() {
                Title       = "Rooftop Networking: Melbourne Tech Edition",
                Description = "Take in views of the Melbourne CBD skyline while connecting with the best of the local tech and startup community. Canapes, open bar and two featured speaker slots. Our most popular interstate event.",
                Location    = "Rooftop at QT Melbourne, 133 Russell St, Melbourne VIC 3000",
                StartDate   = now.AddDays(16).AddHours(5),
                EndDate     = now.AddDays(16).AddHours(8),
                Capacity    = 150,
                Price       = 35m,
                IsPublic    = true,
                Status      = "Published",
                CategoryId  = 5,
                CreatedById = alex.Id,
                ImageUrl    = "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80",
            },
            // [77] Docker Workshop
            new() {
                Title       = "Docker & Containers: Zero to Production",
                Description = "A hands-on full-day workshop taking you from Docker fundamentals to production-ready containerised applications. Covers multi-stage builds, compose, secrets management and a GitHub Actions CI/CD pipeline.",
                Location    = "Atlassian HQ, 341 George St, Sydney NSW 2000",
                StartDate   = now.AddDays(49),
                EndDate     = now.AddDays(49).AddHours(8),
                Capacity    = 25,
                Price       = 349m,
                IsPublic    = true,
                Status      = "Published",
                CategoryId  = 2,
                CreatedById = alex.Id,
                ImageUrl    = "https://images.unsplash.com/photo-1551836022-4c4c79ecde51?auto=format&fit=crop&w=800&q=80",
            },
        };

        db.Events.AddRange(events);
        await db.SaveChangesAsync();

        // ── Event tags ─────────────────────────────────────────────────────────

        db.EventTags.AddRange(
            // AI Summit → Technology, Business
            new EventTag { EventId = events[0].Id, TagId = 2 },
            new EventTag { EventId = events[0].Id, TagId = 3 },
            // React Workshop → Technology, Education
            new EventTag { EventId = events[1].Id, TagId = 2 },
            new EventTag { EventId = events[1].Id, TagId = 7 },
            // Jazz → Music, Entertainment
            new EventTag { EventId = events[2].Id, TagId = 1 },
            new EventTag { EventId = events[2].Id, TagId = 8 },
            // Trail Running → Outdoor, Health & Wellness
            new EventTag { EventId = events[3].Id, TagId = 10 },
            new EventTag { EventId = events[3].Id, TagId = 6 },
            // Networking → Business, Technology
            new EventTag { EventId = events[4].Id, TagId = 3 },
            new EventTag { EventId = events[4].Id, TagId = 2 },
            // Family Fun Day → Family, Entertainment
            new EventTag { EventId = events[5].Id, TagId = 12 },
            new EventTag { EventId = events[5].Id, TagId = 8 },
            // Blockchain → Technology, Business
            new EventTag { EventId = events[6].Id, TagId = 2 },
            new EventTag { EventId = events[6].Id, TagId = 3 },
            // Watercolour → Arts, Education
            new EventTag { EventId = events[7].Id, TagId = 4 },
            new EventTag { EventId = events[7].Id, TagId = 7 },
            // Python Bootcamp → Technology, Education
            new EventTag { EventId = events[8].Id, TagId = 2 },
            new EventTag { EventId = events[8].Id, TagId = 7 },
            // Charity Gala → Charity, Entertainment, Food & Drink
            new EventTag { EventId = events[9].Id, TagId = 11 },
            new EventTag { EventId = events[9].Id, TagId = 8 },
            new EventTag { EventId = events[9].Id, TagId = 5 },
            // DevOps Summit → Technology, Business
            new EventTag { EventId = events[13].Id, TagId = 2 },
            new EventTag { EventId = events[13].Id, TagId = 3 },
            // Italian Cooking → Food & Drink, Education
            new EventTag { EventId = events[14].Id, TagId = 5 },
            new EventTag { EventId = events[14].Id, TagId = 7 },
            // Women in Tech → Technology, Business
            new EventTag { EventId = events[15].Id, TagId = 2 },
            new EventTag { EventId = events[15].Id, TagId = 3 },
            // Photography Walk → Arts, Outdoor
            new EventTag { EventId = events[16].Id, TagId = 4 },
            new EventTag { EventId = events[16].Id, TagId = 10 },
            // Comedy Night → Entertainment, Music
            new EventTag { EventId = events[17].Id, TagId = 8 },
            new EventTag { EventId = events[17].Id, TagId = 1 },

            // ── New events ────────────────────────────────────────────────────

            // Sydney Symphony → Music, Entertainment
            new EventTag { EventId = events[18].Id, TagId = 1 },
            new EventTag { EventId = events[18].Id, TagId = 8 },
            // Hackathon → Technology, Business
            new EventTag { EventId = events[19].Id, TagId = 2 },
            new EventTag { EventId = events[19].Id, TagId = 3 },
            // Meditation → Health & Wellness, Education
            new EventTag { EventId = events[20].Id, TagId = 6 },
            new EventTag { EventId = events[20].Id, TagId = 7 },
            // Craft Beer → Food & Drink, Entertainment
            new EventTag { EventId = events[21].Id, TagId = 5 },
            new EventTag { EventId = events[21].Id, TagId = 8 },
            // Women's Leadership → Business, Education
            new EventTag { EventId = events[22].Id, TagId = 3 },
            new EventTag { EventId = events[22].Id, TagId = 7 },
            // Street Photography → Arts, Outdoor
            new EventTag { EventId = events[23].Id, TagId = 4 },
            new EventTag { EventId = events[23].Id, TagId = 10 },
            // EV Forum → Technology, Business
            new EventTag { EventId = events[24].Id, TagId = 2 },
            new EventTag { EventId = events[24].Id, TagId = 3 },
            // Hip Hop Dance → Arts, Music
            new EventTag { EventId = events[25].Id, TagId = 4 },
            new EventTag { EventId = events[25].Id, TagId = 1 },
            // Startup Pitch → Business, Technology
            new EventTag { EventId = events[26].Id, TagId = 3 },
            new EventTag { EventId = events[26].Id, TagId = 2 },
            // Kids Coding → Technology, Education, Family
            new EventTag { EventId = events[27].Id, TagId = 2 },
            new EventTag { EventId = events[27].Id, TagId = 7 },
            new EventTag { EventId = events[27].Id, TagId = 12 },
            // Wine & Cheese → Food & Drink
            new EventTag { EventId = events[28].Id, TagId = 5 },
            // Rock Climbing → Outdoor, Health & Wellness
            new EventTag { EventId = events[29].Id, TagId = 10 },
            new EventTag { EventId = events[29].Id, TagId = 6 },
            // UX/UI Sprint → Technology, Arts
            new EventTag { EventId = events[30].Id, TagId = 2 },
            new EventTag { EventId = events[30].Id, TagId = 4 },
            // Charity Golf → Charity, Outdoor
            new EventTag { EventId = events[31].Id, TagId = 11 },
            new EventTag { EventId = events[31].Id, TagId = 10 },
            // Sushi Class → Food & Drink, Education
            new EventTag { EventId = events[32].Id, TagId = 5 },
            new EventTag { EventId = events[32].Id, TagId = 7 },
            // MTB Race → Outdoor, Health & Wellness
            new EventTag { EventId = events[33].Id, TagId = 10 },
            new EventTag { EventId = events[33].Id, TagId = 6 },
            // Aerial Yoga → Health & Wellness
            new EventTag { EventId = events[34].Id, TagId = 6 },
            // Board Games → Entertainment, Gaming
            new EventTag { EventId = events[35].Id, TagId = 8 },
            new EventTag { EventId = events[35].Id, TagId = 9 },
            // Finance Workshop → Business, Education
            new EventTag { EventId = events[36].Id, TagId = 3 },
            new EventTag { EventId = events[36].Id, TagId = 7 },
            // Street Food Festival → Food & Drink, Entertainment
            new EventTag { EventId = events[37].Id, TagId = 5 },
            new EventTag { EventId = events[37].Id, TagId = 8 },
            // VR Gaming → Gaming, Technology
            new EventTag { EventId = events[38].Id, TagId = 9 },
            new EventTag { EventId = events[38].Id, TagId = 2 },
            // Sustainable Fashion → Arts, Education
            new EventTag { EventId = events[39].Id, TagId = 4 },
            new EventTag { EventId = events[39].Id, TagId = 7 },
            // Corporate Retreat → Business
            new EventTag { EventId = events[40].Id, TagId = 3 },
            // Marathon Training → Health & Wellness, Outdoor
            new EventTag { EventId = events[41].Id, TagId = 6 },
            new EventTag { EventId = events[41].Id, TagId = 10 },
            // JS Beginners → Technology, Education
            new EventTag { EventId = events[42].Id, TagId = 2 },
            new EventTag { EventId = events[42].Id, TagId = 7 },
            // Live Painting → Arts, Entertainment, Charity
            new EventTag { EventId = events[43].Id, TagId = 4 },
            new EventTag { EventId = events[43].Id, TagId = 8 },
            new EventTag { EventId = events[43].Id, TagId = 11 },
            // Fermentation → Food & Drink, Education
            new EventTag { EventId = events[44].Id, TagId = 5 },
            new EventTag { EventId = events[44].Id, TagId = 7 },
            // Outdoor Cinema → Entertainment
            new EventTag { EventId = events[45].Id, TagId = 8 },
            // Cybersecurity → Technology, Business
            new EventTag { EventId = events[46].Id, TagId = 2 },
            new EventTag { EventId = events[46].Id, TagId = 3 },
            // Salsa Night → Music, Entertainment
            new EventTag { EventId = events[47].Id, TagId = 1 },
            new EventTag { EventId = events[47].Id, TagId = 8 },
            // PM Workshop → Business, Education
            new EventTag { EventId = events[48].Id, TagId = 3 },
            new EventTag { EventId = events[48].Id, TagId = 7 },
            // Night Photography → Arts, Outdoor
            new EventTag { EventId = events[49].Id, TagId = 4 },
            new EventTag { EventId = events[49].Id, TagId = 10 },
            // Charity Fun Run → Charity, Outdoor, Health & Wellness
            new EventTag { EventId = events[50].Id, TagId = 11 },
            new EventTag { EventId = events[50].Id, TagId = 10 },
            new EventTag { EventId = events[50].Id, TagId = 6 },
            // Science Fair → Technology, Education
            new EventTag { EventId = events[51].Id, TagId = 2 },
            new EventTag { EventId = events[51].Id, TagId = 7 },
            // Comedy Open Mic → Entertainment
            new EventTag { EventId = events[52].Id, TagId = 8 },
            // Aqua Yoga → Health & Wellness, Outdoor
            new EventTag { EventId = events[53].Id, TagId = 6 },
            new EventTag { EventId = events[53].Id, TagId = 10 },
            // Kubernetes Bootcamp → Technology, Education
            new EventTag { EventId = events[54].Id, TagId = 2 },
            new EventTag { EventId = events[54].Id, TagId = 7 },
            // Pizza Night → Food & Drink, Education
            new EventTag { EventId = events[55].Id, TagId = 5 },
            new EventTag { EventId = events[55].Id, TagId = 7 },
            // Triathlon Training → Health & Wellness, Outdoor
            new EventTag { EventId = events[56].Id, TagId = 6 },
            new EventTag { EventId = events[56].Id, TagId = 10 },
            // Digital Art → Arts, Education
            new EventTag { EventId = events[57].Id, TagId = 4 },
            new EventTag { EventId = events[57].Id, TagId = 7 },
            // Entrepreneurs Breakfast → Business
            new EventTag { EventId = events[58].Id, TagId = 3 },
            // Astronomy → Education, Outdoor
            new EventTag { EventId = events[59].Id, TagId = 7 },
            new EventTag { EventId = events[59].Id, TagId = 10 },
            // Chess Tournament → Entertainment
            new EventTag { EventId = events[60].Id, TagId = 8 },
            // Sustainable Living Expo → Education
            new EventTag { EventId = events[61].Id, TagId = 7 },
            // Irish Folk → Music, Entertainment
            new EventTag { EventId = events[62].Id, TagId = 1 },
            new EventTag { EventId = events[62].Id, TagId = 8 },
            // Escape Room → Entertainment, Gaming
            new EventTag { EventId = events[63].Id, TagId = 8 },
            new EventTag { EventId = events[63].Id, TagId = 9 },
            // Creative Writing → Arts, Education
            new EventTag { EventId = events[64].Id, TagId = 4 },
            new EventTag { EventId = events[64].Id, TagId = 7 },
            // Asian Street Food → Food & Drink, Entertainment
            new EventTag { EventId = events[65].Id, TagId = 5 },
            new EventTag { EventId = events[65].Id, TagId = 8 },
            // Electric Music Festival → Music, Arts, Entertainment
            new EventTag { EventId = events[66].Id, TagId = 1 },
            new EventTag { EventId = events[66].Id, TagId = 4 },
            new EventTag { EventId = events[66].Id, TagId = 8 },
            // Mental Health First Aid → Health & Wellness, Education
            new EventTag { EventId = events[67].Id, TagId = 6 },
            new EventTag { EventId = events[67].Id, TagId = 7 },
            // Open Water Swim → Outdoor, Health & Wellness
            new EventTag { EventId = events[68].Id, TagId = 10 },
            new EventTag { EventId = events[68].Id, TagId = 6 },
            // Architecture Walk → Arts, Outdoor, Education
            new EventTag { EventId = events[69].Id, TagId = 4 },
            new EventTag { EventId = events[69].Id, TagId = 10 },
            new EventTag { EventId = events[69].Id, TagId = 7 },
            // Korean BBQ → Food & Drink, Entertainment
            new EventTag { EventId = events[70].Id, TagId = 5 },
            new EventTag { EventId = events[70].Id, TagId = 8 },
            // Emerging Artists → Arts, Entertainment
            new EventTag { EventId = events[71].Id, TagId = 4 },
            new EventTag { EventId = events[71].Id, TagId = 8 },
            // Podcast Workshop → Technology, Education
            new EventTag { EventId = events[72].Id, TagId = 2 },
            new EventTag { EventId = events[72].Id, TagId = 7 },
            // Bouldering Comp → Outdoor, Health & Wellness
            new EventTag { EventId = events[73].Id, TagId = 10 },
            new EventTag { EventId = events[73].Id, TagId = 6 },
            // Indigenous Art → Arts, Education
            new EventTag { EventId = events[74].Id, TagId = 4 },
            new EventTag { EventId = events[74].Id, TagId = 7 },
            // Kids Science Camp → Education, Family, Outdoor
            new EventTag { EventId = events[75].Id, TagId = 7 },
            new EventTag { EventId = events[75].Id, TagId = 12 },
            new EventTag { EventId = events[75].Id, TagId = 10 },
            // Rooftop Networking → Business, Technology
            new EventTag { EventId = events[76].Id, TagId = 3 },
            new EventTag { EventId = events[76].Id, TagId = 2 },
            // Docker Workshop → Technology, Education
            new EventTag { EventId = events[77].Id, TagId = 2 },
            new EventTag { EventId = events[77].Id, TagId = 7 }
        );
        await db.SaveChangesAsync();

        // ── Bookings ───────────────────────────────────────────────────────────

        static Booking Book(int userId, int eventId, decimal price, DateTime eventStart,
                            int daysBeforeBook, bool checkedIn = false) => new()
        {
            UserId       = userId,
            EventId      = eventId,
            Status       = "Confirmed",
            BookedAt     = eventStart.AddDays(-daysBeforeBook),
            PointsEarned = (int)Math.Round(price * 10),
            IsCheckedIn  = checkedIn,
            CheckedInAt  = checkedIn ? eventStart.AddMinutes(10) : null,
            CheckInToken = Guid.NewGuid().ToString(),
        };

        var bookings = new List<Booking>
        {
            // ── AI Summit [0] — targeting 120/200 ─────────────────────────────
            Book(sam.Id,   events[0].Id, events[0].Price, events[0].StartDate, 12),
            Book(maya.Id,  events[0].Id, events[0].Price, events[0].StartDate, 10),
            Book(luca.Id,  events[0].Id, events[0].Price, events[0].StartDate,  8),
            Book(anna.Id,  events[0].Id, events[0].Price, events[0].StartDate,  6),
            Book(tom.Id,   events[0].Id, events[0].Price, events[0].StartDate,  5),

            // ── React Workshop [1] — 28/30 (almost full) ──────────────────────
            Book(sam.Id,   events[1].Id, events[1].Price, events[1].StartDate, 6),
            Book(maya.Id,  events[1].Id, events[1].Price, events[1].StartDate, 5),
            Book(luca.Id,  events[1].Id, events[1].Price, events[1].StartDate, 4),
            Book(anna.Id,  events[1].Id, events[1].Price, events[1].StartDate, 3),
            Book(tom.Id,   events[1].Id, events[1].Price, events[1].StartDate, 2),

            // ── Jazz Under the Stars [2] — 180/500 ────────────────────────────
            Book(sam.Id,   events[2].Id, events[2].Price, events[2].StartDate, 14),
            Book(maya.Id,  events[2].Id, events[2].Price, events[2].StartDate, 10),
            Book(anna.Id,  events[2].Id, events[2].Price, events[2].StartDate,  7),

            // ── Trail Running Camp [3] — 38/50 ────────────────────────────────
            Book(sam.Id,   events[3].Id, events[3].Price, events[3].StartDate, 20),
            Book(tom.Id,   events[3].Id, events[3].Price, events[3].StartDate, 15),
            Book(luca.Id,  events[3].Id, events[3].Price, events[3].StartDate, 12),

            // ── Networking Night [4] — 72/100 ─────────────────────────────────
            Book(sam.Id,   events[4].Id, events[4].Price, events[4].StartDate,  8),
            Book(maya.Id,  events[4].Id, events[4].Price, events[4].StartDate,  6),
            Book(luca.Id,  events[4].Id, events[4].Price, events[4].StartDate,  4),
            Book(anna.Id,  events[4].Id, events[4].Price, events[4].StartDate,  3),
            Book(tom.Id,   events[4].Id, events[4].Price, events[4].StartDate,  2),

            // ── Family Fun Day [5] — 95/300 ───────────────────────────────────
            Book(sam.Id,   events[5].Id, events[5].Price, events[5].StartDate, 30),
            Book(anna.Id,  events[5].Id, events[5].Price, events[5].StartDate, 20),
            Book(tom.Id,   events[5].Id, events[5].Price, events[5].StartDate, 10),

            // ── Blockchain Conf [6] — 85/400 ──────────────────────────────────
            Book(maya.Id,  events[6].Id, events[6].Price, events[6].StartDate, 35),
            Book(luca.Id,  events[6].Id, events[6].Price, events[6].StartDate, 20),

            // ── Watercolour Workshop [7] — 18/20 (almost full) ────────────────
            Book(sam.Id,   events[7].Id, events[7].Price, events[7].StartDate, 15),
            Book(maya.Id,  events[7].Id, events[7].Price, events[7].StartDate, 12),
            Book(anna.Id,  events[7].Id, events[7].Price, events[7].StartDate,  8),
            Book(tom.Id,   events[7].Id, events[7].Price, events[7].StartDate,  5),

            // ── Python Bootcamp [8] — 16/30 ───────────────────────────────────
            Book(sam.Id,   events[8].Id, events[8].Price, events[8].StartDate, 25),
            Book(luca.Id,  events[8].Id, events[8].Price, events[8].StartDate, 15),
            Book(tom.Id,   events[8].Id, events[8].Price, events[8].StartDate, 10),

            // ── Charity Gala [9] — 42/80 ──────────────────────────────────────
            Book(maya.Id,  events[9].Id, events[9].Price, events[9].StartDate, 45),
            Book(anna.Id,  events[9].Id, events[9].Price, events[9].StartDate, 30),
            Book(sam.Id,   events[9].Id, events[9].Price, events[9].StartDate, 20),

            // ── DevOps Summit (live) [13] — 185/200 ───────────────────────────
            Book(sam.Id,   events[13].Id, events[13].Price, events[13].StartDate, 10, checkedIn: true),
            Book(maya.Id,  events[13].Id, events[13].Price, events[13].StartDate,  8, checkedIn: true),
            Book(luca.Id,  events[13].Id, events[13].Price, events[13].StartDate,  6, checkedIn: true),
            Book(anna.Id,  events[13].Id, events[13].Price, events[13].StartDate,  5, checkedIn: true),
            Book(tom.Id,   events[13].Id, events[13].Price, events[13].StartDate,  3, checkedIn: true),

            // ── Italian Cooking (past) [14] — 14/15 ───────────────────────────
            Book(sam.Id,   events[14].Id, events[14].Price, events[14].StartDate, 10, checkedIn: true),
            Book(maya.Id,  events[14].Id, events[14].Price, events[14].StartDate,  8, checkedIn: true),
            Book(luca.Id,  events[14].Id, events[14].Price, events[14].StartDate,  6, checkedIn: true),
            Book(anna.Id,  events[14].Id, events[14].Price, events[14].StartDate,  4, checkedIn: true),
            Book(tom.Id,   events[14].Id, events[14].Price, events[14].StartDate,  2, checkedIn: true),

            // ── Women in Tech (past) [15] ──────────────────────────────────────
            Book(sam.Id,   events[15].Id, events[15].Price, events[15].StartDate, 25, checkedIn: true),
            Book(maya.Id,  events[15].Id, events[15].Price, events[15].StartDate, 20, checkedIn: true),
            Book(anna.Id,  events[15].Id, events[15].Price, events[15].StartDate, 15, checkedIn: true),
            Book(tom.Id,   events[15].Id, events[15].Price, events[15].StartDate, 10, checkedIn: true),

            // ── Photography Walk (past) [16] ───────────────────────────────────
            Book(sam.Id,   events[16].Id, events[16].Price, events[16].StartDate, 5, checkedIn: true),
            Book(luca.Id,  events[16].Id, events[16].Price, events[16].StartDate, 4, checkedIn: true),
            Book(tom.Id,   events[16].Id, events[16].Price, events[16].StartDate, 3, checkedIn: true),

            // ── Comedy Night (past) [17] ───────────────────────────────────────
            Book(sam.Id,   events[17].Id, events[17].Price, events[17].StartDate, 7, checkedIn: true),
            Book(maya.Id,  events[17].Id, events[17].Price, events[17].StartDate, 5, checkedIn: true),
            Book(luca.Id,  events[17].Id, events[17].Price, events[17].StartDate, 3, checkedIn: true),
            Book(anna.Id,  events[17].Id, events[17].Price, events[17].StartDate, 2, checkedIn: true),
        };

        db.Bookings.AddRange(bookings);
        await db.SaveChangesAsync();

        // ── Reviews (on completed events) ─────────────────────────────────────

        var reviews = new List<Review>
        {
            // Italian Cooking Masterclass [14]
            new() { EventId = events[14].Id, UserId = sam.Id,  Rating = 5, Comment = "Absolutely incredible evening. Chef Marco's technique for hand-rolled pasta was mind-blowing — I've been making it at home every week since. The tiramisu alone was worth the ticket price. Highest recommendation!", CreatedAt = events[14].EndDate.AddDays(1), IsPinned = true },
            new() { EventId = events[14].Id, UserId = maya.Id, Rating = 5, Comment = "Perfect class for someone who loves cooking but wanted to level up. Small group meant we all got hands-on time with the chef. Came home with recipes AND skills. Will absolutely book Priya's next event.", CreatedAt = events[14].EndDate.AddDays(2) },
            new() { EventId = events[14].Id, UserId = luca.Id, Rating = 4, Comment = "Really enjoyable afternoon. The risotto section was fascinating. Slightly rushed at the end — felt like we could have used another 30 minutes for the dessert section. But overall a great experience.", CreatedAt = events[14].EndDate.AddDays(3) },
            new() { EventId = events[14].Id, UserId = anna.Id, Rating = 5, Comment = "One of the best things I've done in Sydney. Chef Marco is warm, funny and incredibly knowledgeable. The venue was beautiful. Already convinced two friends to book the next class!", CreatedAt = events[14].EndDate.AddDays(2) },
            new() { EventId = events[14].Id, UserId = tom.Id,  Rating = 4, Comment = "Great value for money. All ingredients were top quality and fresh. My only minor gripe is parking was tricky in Surry Hills, but that's hardly the organiser's fault. Pasta turned out amazing!", CreatedAt = events[14].EndDate.AddDays(4) },

            // Women in Tech [15]
            new() { EventId = events[15].Id, UserId = sam.Id,  Rating = 5, Comment = "This conference genuinely changed my career trajectory. The mentorship speed-dating session was brilliant — I connected with my now-mentor in 10 minutes. Alex runs a tight ship and the speakers were world-class.", CreatedAt = events[15].EndDate.AddDays(1), IsPinned = true },
            new() { EventId = events[15].Id, UserId = maya.Id, Rating = 5, Comment = "Inspiring from first keynote to last panel. So refreshing to be in a room of 200 women talking about real engineering challenges without any of the usual gatekeeping. Job fair was also super useful — got two interviews!", CreatedAt = events[15].EndDate.AddDays(2) },
            new() { EventId = events[15].Id, UserId = anna.Id, Rating = 4, Comment = "Excellent event overall. The afternoon sessions were slightly repetitive in themes, but the morning keynote with Dr Sarah Kim was phenomenal. Venue and catering were top notch. Will be back next year.", CreatedAt = events[15].EndDate.AddDays(3) },
            new() { EventId = events[15].Id, UserId = tom.Id,  Rating = 4, Comment = "Attended as an ally and felt very welcome. Great mix of technical talks and career development. The Q&A sections were a highlight — no time-wasting softballs, real questions from an engaged audience.", CreatedAt = events[15].EndDate.AddDays(4) },

            // Photography Walk [16]
            new() { EventId = events[16].Id, UserId = sam.Id,  Rating = 5, Comment = "What a golden-hour experience! Priya's eye for location is incredible — every spot we stopped at had a story and a stunning composition waiting. Came home with 20 photos I'm genuinely proud of.", CreatedAt = events[16].EndDate.AddDays(1) },
            new() { EventId = events[16].Id, UserId = luca.Id, Rating = 5, Comment = "I only had my phone but still took the best photos of my life. The tips on natural light and framing were practical and immediately applicable. Priya has a gift for teaching. Booked the Botanic Garden walk next!", CreatedAt = events[16].EndDate.AddDays(2) },
            new() { EventId = events[16].Id, UserId = tom.Id,  Rating = 4, Comment = "Beautiful walk, great company. Would have loved slightly more time at the Opera House viewpoint — we moved on a bit quickly. But the Harbour Bridge shots at dusk were incredible. Solid 4 stars!", CreatedAt = events[16].EndDate.AddDays(2) },

            // Comedy Night [17]
            new() { EventId = events[17].Id, UserId = sam.Id,  Rating = 5, Comment = "Laughed until I cried. Jordan found five comedians who somehow got funnier as the night went on. The MC kept the energy perfectly between acts. Best night out I've had in Sydney this year.", CreatedAt = events[17].EndDate.AddDays(1), IsPinned = true },
            new() { EventId = events[17].Id, UserId = maya.Id, Rating = 4, Comment = "Really fun night. First three acts were brilliant, fourth was a bit flat, but the closer absolutely killed it. Would have preferred more parking info beforehand — Moore Park can be chaos. Would go again.", CreatedAt = events[17].EndDate.AddDays(2) },
            new() { EventId = events[17].Id, UserId = luca.Id, Rating = 5, Comment = "Hadn't been to a proper comedy night since before COVID and this was the perfect reintroduction. Jokes landed across all age groups — my 55-year-old mum came and she's been quoting the headliner all week.", CreatedAt = events[17].EndDate.AddDays(1) },
            new() { EventId = events[17].Id, UserId = anna.Id, Rating = 3, Comment = "Good atmosphere and a couple of standout acts, but the sound mix was off for the first 20 minutes which made it hard to catch the punchlines. Once the venue fixed it, the show improved a lot. Average overall.", CreatedAt = events[17].EndDate.AddDays(3) },
        };

        db.Reviews.AddRange(reviews);
        await db.SaveChangesAsync();

        // ── Review replies (organizers responding) ─────────────────────────────

        db.ReviewReplies.AddRange(
            new ReviewReply { ReviewId = reviews[0].Id,  UserId = priya.Id, Comment = "Thank you so much, Sam! Chef Marco was over the moon reading this. We're running another session in April — hope to see you back! 🍝", CreatedAt = reviews[0].CreatedAt.AddDays(1) },
            new ReviewReply { ReviewId = reviews[2].Id,  UserId = priya.Id, Comment = "Really appreciate the honest feedback, Luca. You're right — tiramisu deserves more time. We've already extended the class to 5.5 hours for the next round.", CreatedAt = reviews[2].CreatedAt.AddHours(18) },
            new ReviewReply { ReviewId = reviews[5].Id,  UserId = alex.Id,  Comment = "This genuinely made my day, Sam. The mentorship speed-dating was our most requested addition this year. Can't wait to reveal the 2027 lineup!", CreatedAt = reviews[5].CreatedAt.AddDays(1) },
            new ReviewReply { ReviewId = reviews[8].Id,  UserId = alex.Id,  Comment = "Noted on the afternoon sessions — we'll tighten the track themes for next year. Glad Dr Kim's keynote resonated, she was the highlight for many! See you in 2027.", CreatedAt = reviews[8].CreatedAt.AddDays(2) },
            new ReviewReply { ReviewId = reviews[13].Id, UserId = jordan.Id, Comment = "Ha! Venue sound gremlins — I won't let them off the hook. Already spoken to the Comedy Store about their AV setup for next time. Glad it came good in the end!", CreatedAt = reviews[13].CreatedAt.AddDays(1) }
        );
        await db.SaveChangesAsync();

        // ── Announcements ─────────────────────────────────────────────────────

        db.Announcements.AddRange(
            new Announcement {
                EventId   = events[0].Id,
                Title     = "Keynote speaker confirmed: Dr Lisa Chen",
                Message   = "We're thrilled to announce that Dr Lisa Chen, lead researcher at DeepMind, will be delivering our opening keynote on 'Frontier AI Safety and Real-World Applications'. This is an unmissable start to the Summit.",
                CreatedAt = now.AddDays(-3),
            },
            new Announcement {
                EventId   = events[1].Id,
                Title     = "Only 2 spots remaining!",
                Message   = "The React Advanced Patterns workshop is almost sold out — only 2 tickets left. If you've been on the fence, now is the time. Grab yours before they're gone.",
                CreatedAt = now.AddDays(-1),
            },
            new Announcement {
                EventId   = events[4].Id,
                Title     = "Three amazing startups pitching on the night",
                Message   = "We can now reveal the three startups pitching at Thursday's Networking Night: Clearpath AI (autonomous logistics), Bloom Health (preventive care platform), and Mosaic Studio (generative design tools). See you there!",
                CreatedAt = now.AddDays(-2),
            },
            new Announcement {
                EventId   = events[13].Id,
                Title     = "Day 2 agenda is live",
                Message   = "Day 2 kicks off at 9am with a special live demo of our CI/CD pipeline showcase. Don't miss the 2pm roundtable on platform engineering — limited seats, first come first served at the door.",
                CreatedAt = now.AddHours(-8),
            },
            new Announcement {
                EventId   = events[9].Id,
                Title     = "Silent auction preview now online",
                Message   = "Get a sneak peek at the 12 items up for auction on the night — including a signed Aboriginal artwork, a luxury Hunter Valley weekend, and a private chef dinner for 6. Preview at the link in your booking confirmation.",
                CreatedAt = now.AddDays(-7),
            }
        );
        await db.SaveChangesAsync();

        // ── Notifications ─────────────────────────────────────────────────────

        db.Notifications.AddRange(
            // Sam's notifications
            new Notification { UserId = sam.Id, Type = "BookingConfirmation", Title = "Booking confirmed!", Message = $"You're going to \"AI & Machine Learning Summit 2026\" on {events[0].StartDate:MMM d, yyyy}. You earned 1490 loyalty points.", EventId = events[0].Id, IsRead = false, CreatedAt = now.AddDays(-12) },
            new Notification { UserId = sam.Id, Type = "Announcement",        Title = "📢 AI Summit: Keynote speaker confirmed", Message = "Dr Lisa Chen from DeepMind will open the Summit. Don't miss it!", EventId = events[0].Id, IsRead = false, CreatedAt = now.AddDays(-3) },
            new Notification { UserId = sam.Id, Type = "EventReminder",       Title = "AI Summit is tomorrow!", Message = "Your event starts in less than 24 hours. Make sure you have your ticket QR code ready.", EventId = events[0].Id, IsRead = false, CreatedAt = now.AddDays(-1) },
            new Notification { UserId = sam.Id, Type = "BookingConfirmation", Title = "Booking confirmed!", Message = $"You're going to \"React Workshop: Advanced Patterns\" on {events[1].StartDate:MMM d, yyyy}. You earned 790 loyalty points.", EventId = events[1].Id, IsRead = true,  CreatedAt = now.AddDays(-6) },
            new Notification { UserId = sam.Id, Type = "ReviewReminder",      Title = "How was the Italian Cooking Masterclass?", Message = "You attended 2 days ago — share your experience to help others.", EventId = events[14].Id, IsRead = true, CreatedAt = events[14].EndDate.AddDays(1) },

            // Maya's notifications
            new Notification { UserId = maya.Id, Type = "BookingConfirmation", Title = "Booking confirmed!", Message = $"You're going to \"Watercolour Painting Workshop\" on {events[7].StartDate:MMM d, yyyy}. You earned 890 loyalty points.", EventId = events[7].Id, IsRead = false, CreatedAt = now.AddDays(-12) },
            new Notification { UserId = maya.Id, Type = "ReviewReminder",      Title = "How was the Women in Tech Conference?", Message = "You attended last month — share your experience to help others.", EventId = events[15].Id, IsRead = true, CreatedAt = events[15].EndDate.AddDays(1) },
            new Notification { UserId = maya.Id, Type = "WaitlistPromotion",   Title = "You're in! Blockchain & Web3 Conference", Message = "A spot opened up and you've been moved off the waitlist. Your booking is confirmed.", EventId = events[6].Id, IsRead = false, CreatedAt = now.AddDays(-5) },

            // Organizer notifications
            new Notification { UserId = alex.Id, Type = "General", Title = "Your event is getting popular!", Message = "AI & Machine Learning Summit has 5 new bookings in the last 24 hours. You're at 120/200 capacity.", EventId = events[0].Id, IsRead = false, CreatedAt = now.AddDays(-1) },
            new Notification { UserId = priya.Id, Type = "General", Title = "Watercolour Workshop almost full", Message = "Only 2 spots remain. Consider opening a waiting list or planning a second session.", EventId = events[7].Id, IsRead = false, CreatedAt = now.AddDays(-2) }
        );
        await db.SaveChangesAsync();

        // ── Subscriptions ─────────────────────────────────────────────────────

        db.HostSubscriptions.AddRange(
            new HostSubscription { SubscriberId = sam.Id,  HostId = alex.Id,   SubscribedAt = now.AddDays(-60) },
            new HostSubscription { SubscriberId = sam.Id,  HostId = priya.Id,  SubscribedAt = now.AddDays(-45) },
            new HostSubscription { SubscriberId = maya.Id, HostId = alex.Id,   SubscribedAt = now.AddDays(-30) },
            new HostSubscription { SubscriberId = maya.Id, HostId = priya.Id,  SubscribedAt = now.AddDays(-20) },
            new HostSubscription { SubscriberId = luca.Id, HostId = jordan.Id, SubscribedAt = now.AddDays(-15) },
            new HostSubscription { SubscriberId = anna.Id, HostId = alex.Id,   SubscribedAt = now.AddDays(-10) },
            new HostSubscription { SubscriberId = tom.Id,  HostId = priya.Id,  SubscribedAt = now.AddDays(-8)  }
        );
        await db.SaveChangesAsync();

        // ── Store products + purchases ─────────────────────────────────────────

        if (!await db.StoreProducts.AnyAsync())
        {
            var products = new List<StoreProduct>
            {
                new() { Name = "Event Pioneer",            Description = "Awarded to early adopters who booked their first event. Displays proudly on your profile.",             PointCost = 500,  Category = "Badge",       IsActive = true },
                new() { Name = "Super Fan",                Description = "For the devoted — granted to attendees who have attended 10+ events. Show the world your passion.",     PointCost = 1500, Category = "Badge",       IsActive = true },
                new() { Name = "Gold Profile Frame",       Description = "A shimmering gold border around your profile picture. Stand out from the crowd.",                      PointCost = 2000, Category = "Cosmetic",    IsActive = true },
                new() { Name = "Midnight Theme",           Description = "A deep, dark profile theme with midnight-blue accents. Sleek and exclusive.",                          PointCost = 3000, Category = "Cosmetic",    IsActive = true },
                new() { Name = "Priority Booking Pass",   Description = "Get a 24-hour head start on ticket sales before they open to the public. Never miss out again.",       PointCost = 2500, Category = "Feature",     IsActive = true },
                new() { Name = "Extended Review",          Description = "Unlock the ability to write longer reviews (up to 2000 characters) with rich formatting.",             PointCost = 1000, Category = "Feature",     IsActive = true },
                new() { Name = "Featured Organizer Boost",Description = "Pin your next event to the featured section on the homepage for 7 days.",                              PointCost = 5000, Category = "Perk",        IsActive = true },
                new() { Name = "Analytics Pack",           Description = "Unlock advanced analytics for your events — demographic breakdowns, heatmaps, and revenue trends.",    PointCost = 3500, Category = "Perk",        IsActive = true },
                new() { Name = "Event Mascot Figure",      Description = "A virtual limited-edition desk figure of the EventHub mascot. Displayed on your profile forever.",     PointCost = 8000, Category = "Collectible", IsActive = true },
            };

            db.StoreProducts.AddRange(products);
            await db.SaveChangesAsync();

            // Sam has bought a few items
            db.UserPurchases.AddRange(
                new UserPurchase { UserId = sam.Id, ProductId = products[0].Id, PurchasedAt = now.AddDays(-50), PointsSpent = products[0].PointCost },
                new UserPurchase { UserId = sam.Id, ProductId = products[4].Id, PurchasedAt = now.AddDays(-20), PointsSpent = products[4].PointCost },
                new UserPurchase { UserId = maya.Id, ProductId = products[0].Id, PurchasedAt = now.AddDays(-30), PointsSpent = products[0].PointCost },
                new UserPurchase { UserId = maya.Id, ProductId = products[5].Id, PurchasedAt = now.AddDays(-10), PointsSpent = products[5].PointCost }
            );
            await db.SaveChangesAsync();
        }
    }
}
