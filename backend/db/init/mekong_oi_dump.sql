--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5 (Debian 17.5-1.pgdg110+1)
-- Dumped by pg_dump version 17.5 (Debian 17.5-1.pgdg110+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: postgis; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;


--
-- Name: EXTENSION postgis; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION postgis IS 'PostGIS geometry and geography spatial types and functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: ad_clicks_impressions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ad_clicks_impressions (
    id bigint NOT NULL,
    ad_id integer,
    place_id bigint,
    user_id uuid,
    event_type character varying(20) NOT NULL,
    ip_address character varying(45),
    user_agent text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ad_clicks_impressions_event_type_check CHECK (((event_type)::text = ANY ((ARRAY['impression'::character varying, 'click'::character varying])::text[])))
);


ALTER TABLE public.ad_clicks_impressions OWNER TO postgres;

--
-- Name: ad_clicks_impressions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ad_clicks_impressions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ad_clicks_impressions_id_seq OWNER TO postgres;

--
-- Name: ad_clicks_impressions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ad_clicks_impressions_id_seq OWNED BY public.ad_clicks_impressions.id;


--
-- Name: ads; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ads (
    id integer NOT NULL,
    provider_id integer,
    place_id bigint,
    title character varying(150) NOT NULL,
    image_url character varying(255) NOT NULL,
    type character varying(20) NOT NULL,
    target_url character varying(255),
    start_date timestamp with time zone NOT NULL,
    end_date timestamp with time zone NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    CONSTRAINT chk_ad_dates CHECK ((start_date <= end_date))
);


ALTER TABLE public.ads OWNER TO postgres;

--
-- Name: ads_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ads_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ads_id_seq OWNER TO postgres;

--
-- Name: ads_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ads_id_seq OWNED BY public.ads.id;


--
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    icon_url character varying(255) NOT NULL,
    marker_color character varying(7) NOT NULL,
    name_vi character varying(100) NOT NULL,
    name_en character varying(100) NOT NULL
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categories_id_seq OWNER TO postgres;

--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: districts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.districts (
    id integer NOT NULL,
    province_id integer NOT NULL,
    slug character varying(100) NOT NULL,
    name_vi character varying(100) NOT NULL,
    name_en character varying(100) NOT NULL,
    is_visible boolean DEFAULT true NOT NULL
);


ALTER TABLE public.districts OWNER TO postgres;

--
-- Name: districts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.districts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.districts_id_seq OWNER TO postgres;

--
-- Name: districts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.districts_id_seq OWNED BY public.districts.id;


--
-- Name: favorites; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.favorites (
    user_id uuid NOT NULL,
    place_id bigint NOT NULL
);


ALTER TABLE public.favorites OWNER TO postgres;

--
-- Name: gamification_configs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.gamification_configs (
    action_key character varying(50) NOT NULL,
    points integer NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.gamification_configs OWNER TO postgres;

--
-- Name: loyalty_points_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.loyalty_points_history (
    id bigint NOT NULL,
    user_id uuid NOT NULL,
    action_type character varying(50) NOT NULL,
    points_earned integer NOT NULL,
    blockchain_status character varying(20) DEFAULT 'none'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.loyalty_points_history OWNER TO postgres;

--
-- Name: loyalty_points_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.loyalty_points_history_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.loyalty_points_history_id_seq OWNER TO postgres;

--
-- Name: loyalty_points_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.loyalty_points_history_id_seq OWNED BY public.loyalty_points_history.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id bigint NOT NULL,
    user_id uuid,
    title_vi character varying(150) NOT NULL,
    title_en character varying(150) NOT NULL,
    content_vi text NOT NULL,
    content_en text NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notifications_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_id_seq OWNER TO postgres;

--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: place_images; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.place_images (
    id bigint NOT NULL,
    place_id bigint NOT NULL,
    image_url character varying(255) NOT NULL,
    is_primary boolean DEFAULT false NOT NULL
);


ALTER TABLE public.place_images OWNER TO postgres;

--
-- Name: place_images_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.place_images_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.place_images_id_seq OWNER TO postgres;

--
-- Name: place_images_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.place_images_id_seq OWNED BY public.place_images.id;


--
-- Name: places; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.places (
    id bigint NOT NULL,
    province_id integer NOT NULL,
    category_id integer NOT NULL,
    name_vi character varying(255) NOT NULL,
    name_en character varying(255) NOT NULL,
    description_vi text NOT NULL,
    description_en text NOT NULL,
    address_vi character varying(255) NOT NULL,
    address_en character varying(255) NOT NULL,
    latitude numeric(10,8) NOT NULL,
    longitude numeric(11,8) NOT NULL,
    geom public.geometry(Point,4326) NOT NULL,
    phone character varying(20),
    opening_hours character varying(255),
    price_range character varying(100),
    has_parking boolean DEFAULT false NOT NULL,
    avg_rating numeric(2,1) DEFAULT 0.0 NOT NULL,
    total_reviews integer DEFAULT 0 NOT NULL,
    total_favorites integer DEFAULT 0 NOT NULL,
    total_visits integer DEFAULT 0 NOT NULL,
    total_views integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.places OWNER TO postgres;

--
-- Name: places_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.places_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.places_id_seq OWNER TO postgres;

--
-- Name: places_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.places_id_seq OWNED BY public.places.id;


--
-- Name: providers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.providers (
    id integer NOT NULL,
    name character varying(150) NOT NULL,
    logo_url character varying(255),
    contact_name character varying(100),
    phone character varying(20),
    email character varying(255),
    website_url character varying(255),
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT providers_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'inactive'::character varying])::text[])))
);


ALTER TABLE public.providers OWNER TO postgres;

--
-- Name: providers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.providers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.providers_id_seq OWNER TO postgres;

--
-- Name: providers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.providers_id_seq OWNED BY public.providers.id;


--
-- Name: provinces; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.provinces (
    id integer NOT NULL,
    slug character varying(100) NOT NULL,
    name_vi character varying(100) NOT NULL,
    name_en character varying(100) NOT NULL,
    is_visible boolean DEFAULT true NOT NULL
);


ALTER TABLE public.provinces OWNER TO postgres;

--
-- Name: provinces_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.provinces_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.provinces_id_seq OWNER TO postgres;

--
-- Name: provinces_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.provinces_id_seq OWNED BY public.provinces.id;


--
-- Name: review_images; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.review_images (
    id bigint NOT NULL,
    review_id bigint NOT NULL,
    image_url character varying(255) NOT NULL
);


ALTER TABLE public.review_images OWNER TO postgres;

--
-- Name: review_images_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.review_images_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.review_images_id_seq OWNER TO postgres;

--
-- Name: review_images_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.review_images_id_seq OWNED BY public.review_images.id;


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reviews (
    id bigint NOT NULL,
    user_id uuid NOT NULL,
    place_id bigint NOT NULL,
    rating integer NOT NULL,
    comment text NOT NULL,
    status character varying(20) DEFAULT 'approved'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


ALTER TABLE public.reviews OWNER TO postgres;

--
-- Name: reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reviews_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reviews_id_seq OWNER TO postgres;

--
-- Name: reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reviews_id_seq OWNED BY public.reviews.id;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    name character varying(50) NOT NULL
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_id_seq OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: trip_places; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.trip_places (
    id bigint NOT NULL,
    trip_id uuid NOT NULL,
    place_id bigint NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.trip_places OWNER TO postgres;

--
-- Name: trip_places_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.trip_places_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.trip_places_id_seq OWNER TO postgres;

--
-- Name: trip_places_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.trip_places_id_seq OWNED BY public.trip_places.id;


--
-- Name: trips; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.trips (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    title character varying(150) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.trips OWNER TO postgres;

--
-- Name: user_checkins; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_checkins (
    id bigint NOT NULL,
    user_id uuid NOT NULL,
    place_id bigint NOT NULL,
    verified_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.user_checkins OWNER TO postgres;

--
-- Name: user_checkins_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_checkins_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_checkins_id_seq OWNER TO postgres;

--
-- Name: user_checkins_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_checkins_id_seq OWNED BY public.user_checkins.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    role_id integer DEFAULT 2 NOT NULL,
    email character varying(255),
    phone character varying(20),
    password_hash character varying(255),
    provider character varying(20) DEFAULT 'credentials'::character varying NOT NULL,
    full_name character varying(100) NOT NULL,
    avatar_url character varying(255),
    home_town character varying(100),
    bio text,
    total_points integer DEFAULT 0 NOT NULL,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: ad_clicks_impressions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ad_clicks_impressions ALTER COLUMN id SET DEFAULT nextval('public.ad_clicks_impressions_id_seq'::regclass);


--
-- Name: ads id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ads ALTER COLUMN id SET DEFAULT nextval('public.ads_id_seq'::regclass);


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: districts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.districts ALTER COLUMN id SET DEFAULT nextval('public.districts_id_seq'::regclass);


--
-- Name: loyalty_points_history id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.loyalty_points_history ALTER COLUMN id SET DEFAULT nextval('public.loyalty_points_history_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: place_images id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.place_images ALTER COLUMN id SET DEFAULT nextval('public.place_images_id_seq'::regclass);


--
-- Name: places id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.places ALTER COLUMN id SET DEFAULT nextval('public.places_id_seq'::regclass);


--
-- Name: providers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.providers ALTER COLUMN id SET DEFAULT nextval('public.providers_id_seq'::regclass);


--
-- Name: provinces id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.provinces ALTER COLUMN id SET DEFAULT nextval('public.provinces_id_seq'::regclass);


--
-- Name: review_images id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review_images ALTER COLUMN id SET DEFAULT nextval('public.review_images_id_seq'::regclass);


--
-- Name: reviews id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews ALTER COLUMN id SET DEFAULT nextval('public.reviews_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: trip_places id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trip_places ALTER COLUMN id SET DEFAULT nextval('public.trip_places_id_seq'::regclass);


--
-- Name: user_checkins id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_checkins ALTER COLUMN id SET DEFAULT nextval('public.user_checkins_id_seq'::regclass);


--
-- Data for Name: ad_clicks_impressions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ad_clicks_impressions (id, ad_id, place_id, user_id, event_type, ip_address, user_agent, created_at) FROM stdin;
\.


--
-- Data for Name: ads; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ads (id, provider_id, place_id, title, image_url, type, target_url, start_date, end_date, is_active) FROM stdin;
1	2	1	Chợ nổi Cái Răng Promotion	https://mekongoi.vn/images/cairang-1.jpg	sponsored	\N	2026-06-23 07:44:50.421756+00	2026-07-24 07:44:50.421756+00	t
2	1	3	Victoria Resort Promotion	https://example.com/logo-victoria.png	sponsored	\N	2026-06-23 07:44:50.421756+00	2026-07-24 07:44:50.421756+00	t
3	3	7	Khu du lịch Làng Bè Bến Tre Promotion	https://mekongoi.vn/images/langbe.jpg	sponsored	\N	2026-06-23 07:44:50.421756+00	2026-07-24 07:44:50.421756+00	t
4	1	11	Chợ đêm Phú Quốc Promotion	https://mekongoi.vn/images/phuquoc-market-1.jpg	sponsored	\N	2026-06-23 07:44:50.421756+00	2026-07-24 07:44:50.421756+00	t
5	\N	\N	Banner Khuyến Mãi	https://example.com/banner.jpg	home	https://example.com/promo	2026-06-24 07:45:07.594+00	2026-06-25 07:45:07.594+00	t
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, icon_url, marker_color, name_vi, name_en) FROM stdin;
1	https://cdn-icons-png.flaticon.com/512/2983/2983057.png	#FF5733	Quán ăn	Restaurant
2	https://cdn-icons-png.flaticon.com/512/2913/2913564.png	#33FF57	Khách sạn	Hotel
3	https://cdn-icons-png.flaticon.com/512/854/854878.png	#3357FF	Điểm du lịch	Attraction
4	https://cdn-icons-png.flaticon.com/512/3170/3170733.png	#E133FF	Đặc sản	Souvenir
5	https://cdn-icons-png.flaticon.com/512/2734/2734039.png	#FFC133	Cafe	Cafe
6	https://cdn-icons-png.flaticon.com/512/489/489874.png	#33FFF0	Homestay	Homestay
7	https://example.com/icon.png	#FF0000	Thể Loại Cập Nhật	Test Category
\.


--
-- Data for Name: districts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.districts (id, province_id, slug, name_vi, name_en, is_visible) FROM stdin;
1	1	ninh-kieu	Ninh Kiều	Ninh Kieu	t
2	1	cai-rang	Cái Răng	Cai Rang	t
3	2	chau-doc	Châu Đốc	Chau Doc	t
4	2	tinh-bien	Tịnh Biên	Tinh Bien	t
5	3	tp-ben-tre	TP. Bến Tre	Ben Tre City	t
\.


--
-- Data for Name: favorites; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.favorites (user_id, place_id) FROM stdin;
65d07cd3-6107-4251-aaa0-5f9dda952380	16
a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	1
b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22	1
\.


--
-- Data for Name: gamification_configs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.gamification_configs (action_key, points, updated_at) FROM stdin;
daily_checkin	10	2026-06-24 07:44:50.451+00
review	30	2026-06-24 07:44:50.451+00
share_app	20	2026-06-24 07:44:50.451+00
place_checkin	50	2026-06-24 07:44:50.451+00
checkin_bonus_1782287107600	50	2026-06-24 07:45:07.604+00
\.


--
-- Data for Name: loyalty_points_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.loyalty_points_history (id, user_id, action_type, points_earned, blockchain_status, created_at) FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, user_id, title_vi, title_en, content_vi, content_en, is_read, created_at) FROM stdin;
10	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Chào mừng bạn mới!	Welcome new user!	Chào mừng bạn đã tham gia ứng dụng du lịch Mekong Ơi. Hãy bắt đầu check-in để tích lũy điểm thưởng nhé!	Welcome to Mekong Oi travel app. Start checking in to accumulate points!	f	2026-06-24 07:44:50.462+00
11	\N	Bảo trì hệ thống định kỳ	Scheduled System Maintenance	Mekong Ơi sẽ bảo trì hệ thống từ 01:00 đến 03:00 sáng ngày 25/06/2026.	Mekong Oi will be undergoing maintenance from 01:00 to 03:00 AM on June 25, 2026.	f	2026-06-24 07:44:50.462+00
\.


--
-- Data for Name: place_images; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.place_images (id, place_id, image_url, is_primary) FROM stdin;
36	1	https://mekongoi.vn/images/cairang-1.jpg	t
37	1	https://mekongoi.vn/images/cairang-2.jpg	f
38	2	https://mekongoi.vn/images/hoido-1.jpg	t
39	4	https://mekongoi.vn/images/trasu-1.jpg	t
40	4	https://mekongoi.vn/images/trasu-2.jpg	f
41	11	https://mekongoi.vn/images/phuquoc-market-1.jpg	t
42	16	https://example.com/halong.jpg	t
\.


--
-- Data for Name: places; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.places (id, province_id, category_id, name_vi, name_en, description_vi, description_en, address_vi, address_en, latitude, longitude, geom, phone, opening_hours, price_range, has_parking, avg_rating, total_reviews, total_favorites, total_visits, total_views) FROM stdin;
2	1	1	Quán Ăn Hồi Đó	Hoi Do Restaurant	Quán ăn mang phong cách miền Tây xưa cũ, cơm điền dã.	A retro-styled restaurant serving traditional Southern meals.	56 Trần Bình Trọng, Ninh Kiều, Cần Thơ	56 Tran Binh Trong, Can Tho	10.03417900	105.77918300	0101000020E610000059A65F22DE715A40836BEEE87F112440	0939123456	10:00 - 22:00	40.000đ - 150.000đ	t	4.5	1	23	80	600
3	1	2	Khách sạn Victoria Cần Thơ Resort	Victoria Can Tho Resort	Khu nghỉ dưỡng sang trọng bậc nhất bên bờ sông Hậu.	Luxury colonial-style resort located on the banks of Hau River.	Phường Cái Khế, Ninh Kiều, Cần Thơ	Cai Khe Ward, Can Tho	10.04652200	105.78693100	0101000020E6100000594DD7135D725A40CA1649BBD1172440	02923810111	24/7	1.500.000đ - 4.000.000đ	t	4.7	0	89	40	2300
4	2	3	Rừng tràm Trà Sư	Tra Su Cajuput Forest	Hệ sinh thái rừng ngập mặn tuyệt đẹp với thảm bèo xanh mướt.	A stunning flooded mangrove forest filled with green duckweed.	Văn Giáo, Tịnh Biên, An Giang	Van Giao, Tinh Bien, An Giang	10.55397400	105.05067200	0101000020E6100000ABB4C5353E435A402AABE97AA21B2540	\N	07:00 - 17:30	100.000đ - 200.000đ	t	4.6	1	110	310	4200
5	2	3	Miếu Bà Chúa Xứ Núi Sam	Ba Chua Xu Temple	Trung tâm hành hương tâm linh lớn nhất Đồng bằng Sông Cửu Long.	The most famous spiritual pilgrimage site in the Mekong Delta.	Phường Núi Sam, TP. Châu Đốc, An Giang	Nui Sam Ward, Chau Doc, An Giang	10.68019400	105.07755300	0101000020E61000003AADDBA0F6445A40F0DE5163425C2540	\N	24/7	Miễn phí	t	4.4	0	320	1500	9800
6	2	6	Fami Homestay Châu Đốc	Fami Homestay Chau Doc	Homestay miệt vườn yên bình gần trung tâm thành phố.	A peaceful countryside homestay near downtown.	Vĩnh Mỹ, Châu Đốc, An Giang	Vinh My, Chau Doc, An Giang	10.70112300	105.12234100	0101000020E6100000707D586FD4475A4063F20698F9662540	0912345678	24/7	350.000đ - 600.000đ	t	4.8	0	15	12	180
7	3	3	Khu du lịch Làng Bè Bến Tre	Lang Be Tourist Area	Nơi trải nghiệm các trò chơi dân gian sông nước Miền Tây vui nhộn.	An amusement park featuring traditional Southern river games.	An Khánh, Châu Thành, Bến Tre	An Khanh, Chau Thanh, Ben Tre	10.29255600	106.32943200	0101000020E61000006090F46915955A40457F68E6C9952440	0949911999	08:00 - 18:00	50.000đ - 250.000đ	t	4.3	0	64	520	3100
8	3	4	Kẹo dừa Thanh Long	Thanh Long Coconut Candy	Lò sản xuất kẹo dừa truyền thống lâu đời, tham quan miễn phí.	A long-standing traditional coconut candy workshop.	Phường 4, TP. Bến Tre, Bến Tre	Ward 4, Ben Tre City, Ben Tre	10.24155300	106.37684300	0101000020E61000007F2E1A321E985A405A80B6D5AC7B2440	02753822456	07:30 - 21:00	20.000đ - 100.000đ	t	4.5	0	42	90	850
9	4	3	Làng hoa kiểng Sa Đéc	Sa Dec Flower Village	Vương quốc hoa của miền Tây với hàng trăm loài hoa khoe sắc.	The flower capital of the Mekong Delta with hundreds of species.	Tân Quy Đông, Sa Đéc, Đồng Tháp	Tan Quy Dong, Sa Dec, Dong Thap	10.30872200	105.77254300	0101000020E61000003DF0315871715A40861C5BCF109E2440	\N	06:00 - 18:00	20.000đ - 50.000đ	t	4.6	0	210	890	5600
10	4	1	Nhà cổ Huỳnh Thủy Lê	Huynh Thuy Le Ancient House	Ngôi nhà cổ nổi tiếng gắn liền với tiểu thuyết "Người tình".	The famous ancient house associated with the novel "The Lover".	255A Nguyễn Huệ, Sa Đéc, Đồng Tháp	255A Nguyen Hue, Sa Dec, Dong Thap	10.29123400	105.76123400	0101000020E61000009CA6CF0EB8705A406EF7729F1C952440	02773863215	07:00 - 17:00	20.000đ	t	4.5	0	78	140	1900
11	5	3	Chợ đêm Phú Quốc	Phu Quoc Night Market	Thiên đường ẩm sực hải sản và mua sắm về đêm tại đảo ngọc.	A paradise of seafood street food and night shopping on Pearl Island.	Đường Bạch Đằng, Dương Đông, Phú Quốc	Bach Dang Street, Phu Quoc	10.21852200	103.95754300	0101000020E6100000E1606F6248FD5940BCE9961DE26F2440	\N	17:00 - 23:30	50.000đ - 500.000đ	f	4.2	0	430	2500	15000
12	5	2	Khu nghỉ dưỡng Sunset Sanato	Sunset Sanato Resort	Nơi ngắm hoàng hôn đẹp nhất Phú Quốc với các kiến trúc độc lạ.	The most famous sunset-watching beach resort in Phu Quoc.	Bãi Trường, Dương Tơ, Phú Quốc	Truong Beach, Duong To, Phu Quoc	10.17412200	103.96123400	0101000020E610000069739CDB84FD59403A07CF8426592440	02976266666	24/7	1.200.000đ - 3.500.000đ	t	4.4	0	190	680	7400
13	1	5	Chợ Nổi Coffee	Cho Noi Coffee	Quán cafe view sông ngắm ghe thuyền lướt qua cực chill.	A river-view cafe to watch local boats passing by.	Ninh Kiều, Cần Thơ	Ninh Kieu, Can Tho	10.02891200	105.78012300	0101000020E6100000E0F60489ED715A4085ECBC8DCD0E2440	\N	06:00 - 22:00	25.000đ - 50.000đ	t	4.5	0	12	35	450
14	3	5	Ba Đống Cafe Bến Tre	Ba Dong Cafe	Quán cafe phong cách miệt vườn, không gian rợp bóng dừa xanh.	A garden-style cafe surrounded by green coconut trees.	Hùng Vương, TP. Bến Tre	Hung Vuong, Ben Tre City	10.23891200	106.37912300	0101000020E6100000558A1D8D43985A40703E75AC527A2440	\N	07:00 - 22:00	20.000đ - 45.000đ	t	4.3	0	8	14	290
15	2	4	Đặc sản Tung Lò Mò Châu Phong	Chau Phong Tung Lo Mo	Nơi bán lạp xưởng bò truyền thống của người Chăm An Giang.	Traditional beef sausage workshop of Cham ethnic group.	Châu Phong, Tân Châu, An Giang	Chau Phong, Tan Châu, An Giang	10.82134500	105.15234500	0101000020E6100000622D3E05C0495A405C77F35487A42540	0988776655	06:00 - 21:00	150.000đ - 300.000đ	t	4.7	0	56	120	1100
16	6	3	Vịnh Hạ Long	Vịnh Hạ Long	Di sản thiên nhiên thế giới	Di sản thiên nhiên thế giới	Quảng Ninh	Quảng Ninh	10.00000000	105.00000000	0101000020E61000000000000000405A400000000000002440		08:00 - 17:00		f	0.0	0	1	0	0
1	1	3	Chợ nổi Cái Răng	Cai Rang Floating Market	Chợ nổi chuyên mua bán nông sản, trái cây ở sông Cái Răng.	A bustling floating market famous for local agricultural products.	Sông Cái Răng, Quận Cái Răng, Cần Thơ	Cai Rang River, Can Tho	10.00518700	105.74681600	0101000020E61000004A0856D5CB6F5A408CBAD6DEA7022440	02923123456	05:00 - 09:00	20.000đ - 100.000đ	f	4.8	2	47	120	1500
\.


--
-- Data for Name: providers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.providers (id, name, logo_url, contact_name, phone, email, website_url, status, created_at) FROM stdin;
1	Victoria Resort Group	https://example.com/logo-victoria.png	Nguyễn Văn Thành	0912111222	contact@victoriaresorts.com	https://victoriaresorts.com	active	2026-06-24 07:44:50.28918+00
2	Quán Ăn Hồi Đó Group	https://example.com/logo-hoido.png	Lê Thị Út	0939123456	info@hoidocantho.vn	https://facebook.com/hoidocantho	active	2026-06-24 07:44:50.28918+00
3	Đặc sản Bến Tre Thanh Long	https://example.com/logo-thanhlong.png	Trần Thanh Long	02753822456	sales@keoduathanhlong.vn	https://keoduathanhlong.vn	active	2026-06-24 07:44:50.28918+00
\.


--
-- Data for Name: provinces; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.provinces (id, slug, name_vi, name_en, is_visible) FROM stdin;
1	can-tho	Cần Thơ	Can Tho	t
2	an-giang	An Giang	An Giang	t
3	ben-tre	Bến Tre	Ben Tre	t
4	dong-thap	Đồng Tháp	Dong Thap	t
5	kien-giang	Kiên Giang	Kien Giang	t
6	qu-ng-ninh	Quảng Ninh	Quảng Ninh	t
7	test-province-slug-1782287107560	Tỉnh Thử Nghiệm Cập Nhật	Test Province	t
\.


--
-- Data for Name: review_images; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.review_images (id, review_id, image_url) FROM stdin;
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reviews (id, user_id, place_id, rating, comment, status, created_at) FROM stdin;
1	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	1	5	Hủ tiếu lắc ghe ngon xuất sắc, view bình minh bao phê!	approved	2026-06-24 07:44:50.430576+00
2	b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22	1	4	Amazing traditional floating culture! Love the fresh pineapple.	approved	2026-06-24 07:44:50.430576+00
3	c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33	2	5	Cơm kho quẹt đúng chuẩn vị ngoại nấu ngày xưa, không gian ấm cúng.	approved	2026-06-24 07:44:50.430576+00
4	b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22	4	4	So green and beautiful, dynamic bird sanctuary!	approved	2026-06-24 07:44:50.430576+00
5	65d07cd3-6107-4251-aaa0-5f9dda952380	16	5	Tuyệt vời ông mặt trời!	approved	2026-06-24 07:45:07.536+00
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, name) FROM stdin;
1	admin
2	user
3	staff
\.


--
-- Data for Name: spatial_ref_sys; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spatial_ref_sys (srid, auth_name, auth_srid, srtext, proj4text) FROM stdin;
\.


--
-- Data for Name: trip_places; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.trip_places (id, trip_id, place_id, sort_order) FROM stdin;
21	e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55	1	1
22	e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55	2	2
23	e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55	4	3
\.


--
-- Data for Name: trips; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.trips (id, user_id, title, created_at) FROM stdin;
e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Phượt Cần Thơ - An Giang 3 Ngày	2026-06-24 07:44:50.44+00
\.


--
-- Data for Name: user_checkins; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_checkins (id, user_id, place_id, verified_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, role_id, email, phone, password_hash, provider, full_name, avatar_url, home_town, bio, total_points, status, created_at) FROM stdin;
a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	2	dukhach1@gmail.com	0901234567	$2b$10$0PWuqTbAgorpx6r.3NB1wu9y9I.5hhXQyYJbHHgSBXXdqJPx/EDGi	credentials	Nguyễn Văn Tây	\N	TP. Hồ Chí Minh	\N	350	active	2026-06-24 07:44:50.406+00
b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22	2	john_tourist@yahoo.com	0918888888	$2b$10$0PWuqTbAgorpx6r.3NB1wu9y9I.5hhXQyYJbHHgSBXXdqJPx/EDGi	credentials	John Terry	\N	London	\N	120	active	2026-06-24 07:44:50.406+00
c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33	2	mientay_lover@gmail.com	0939991122	$2b$10$0PWuqTbAgorpx6r.3NB1wu9y9I.5hhXQyYJbHHgSBXXdqJPx/EDGi	credentials	Lê Trần Ninh Kiều	\N	Cần Thơ	\N	500	active	2026-06-24 07:44:50.406+00
d3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44	1	admin_test@mekongoi.vn	0944555666	$2b$10$0PWuqTbAgorpx6r.3NB1wu9y9I.5hhXQyYJbHHgSBXXdqJPx/EDGi	credentials	Trần Văn CMS	\N	Bến Tre	\N	0	active	2026-06-24 07:44:50.406+00
65d07cd3-6107-4251-aaa0-5f9dda952380	1	testuser_1782287107203@example.com	0999845122	$2b$10$y9EGLpEYBHcveDW3a.Q.3OlwHkoPEBOINoTurSGRub/plIoXQ7zjm	credentials	Test User	\N	\N	\N	0	active	2026-06-24 07:45:07.374+00
42c7a3b6-823b-4689-9018-adfbc357aca8	1	testuser_1782287125322@example.com	0999183009	$2b$10$TNoaWjiM2HjLUwoT7tupWOmDzKOwtAMxJXE4g5qgsGRXkN7SdfdD6	credentials	Test User	\N	\N	\N	0	active	2026-06-24 07:45:25.508+00
\.


--
-- Name: ad_clicks_impressions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ad_clicks_impressions_id_seq', 2, true);


--
-- Name: ads_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ads_id_seq', 6, true);


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categories_id_seq', 8, true);


--
-- Name: districts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.districts_id_seq', 6, true);


--
-- Name: loyalty_points_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.loyalty_points_history_id_seq', 6, true);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notifications_id_seq', 12, true);


--
-- Name: place_images_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.place_images_id_seq', 43, true);


--
-- Name: places_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.places_id_seq', 17, true);


--
-- Name: providers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.providers_id_seq', 4, true);


--
-- Name: provinces_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.provinces_id_seq', 8, true);


--
-- Name: review_images_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.review_images_id_seq', 1, false);


--
-- Name: reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reviews_id_seq', 6, true);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_id_seq', 3, true);


--
-- Name: trip_places_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.trip_places_id_seq', 24, true);


--
-- Name: user_checkins_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_checkins_id_seq', 6, true);


--
-- Name: ad_clicks_impressions ad_clicks_impressions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ad_clicks_impressions
    ADD CONSTRAINT ad_clicks_impressions_pkey PRIMARY KEY (id);


--
-- Name: ads ads_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ads
    ADD CONSTRAINT ads_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: districts districts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.districts
    ADD CONSTRAINT districts_pkey PRIMARY KEY (id);


--
-- Name: favorites favorites_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_pkey PRIMARY KEY (user_id, place_id);


--
-- Name: gamification_configs gamification_configs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gamification_configs
    ADD CONSTRAINT gamification_configs_pkey PRIMARY KEY (action_key);


--
-- Name: loyalty_points_history loyalty_points_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.loyalty_points_history
    ADD CONSTRAINT loyalty_points_history_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: place_images place_images_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.place_images
    ADD CONSTRAINT place_images_pkey PRIMARY KEY (id);


--
-- Name: places places_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.places
    ADD CONSTRAINT places_pkey PRIMARY KEY (id);


--
-- Name: providers providers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.providers
    ADD CONSTRAINT providers_pkey PRIMARY KEY (id);


--
-- Name: provinces provinces_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.provinces
    ADD CONSTRAINT provinces_pkey PRIMARY KEY (id);


--
-- Name: provinces provinces_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.provinces
    ADD CONSTRAINT provinces_slug_key UNIQUE (slug);


--
-- Name: review_images review_images_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review_images
    ADD CONSTRAINT review_images_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: roles roles_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_key UNIQUE (name);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: trip_places trip_places_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trip_places
    ADD CONSTRAINT trip_places_pkey PRIMARY KEY (id);


--
-- Name: trips trips_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trips
    ADD CONSTRAINT trips_pkey PRIMARY KEY (id);


--
-- Name: user_checkins user_checkins_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_checkins
    ADD CONSTRAINT user_checkins_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_ad_logs_ad; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ad_logs_ad ON public.ad_clicks_impressions USING btree (ad_id);


--
-- Name: idx_ad_logs_place; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ad_logs_place ON public.ad_clicks_impressions USING btree (place_id);


--
-- Name: idx_ad_logs_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ad_logs_user ON public.ad_clicks_impressions USING btree (user_id);


--
-- Name: idx_ads_place; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ads_place ON public.ads USING btree (place_id);


--
-- Name: idx_ads_provider; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ads_provider ON public.ads USING btree (provider_id);


--
-- Name: idx_loyalty_history_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_loyalty_history_user ON public.loyalty_points_history USING btree (user_id);


--
-- Name: idx_notifications_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_user ON public.notifications USING btree (user_id);


--
-- Name: idx_place_images_place; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_place_images_place ON public.place_images USING btree (place_id);


--
-- Name: idx_places_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_places_category ON public.places USING btree (category_id);


--
-- Name: idx_places_geom; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_places_geom ON public.places USING gist (geom);


--
-- Name: idx_places_name_vi_lower; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_places_name_vi_lower ON public.places USING btree (lower((name_vi)::text));


--
-- Name: idx_places_province; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_places_province ON public.places USING btree (province_id);


--
-- Name: idx_reviews_place; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reviews_place ON public.reviews USING btree (place_id);


--
-- Name: idx_trip_places_trip; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_trip_places_trip ON public.trip_places USING btree (trip_id);


--
-- Name: ad_clicks_impressions ad_clicks_impressions_ad_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ad_clicks_impressions
    ADD CONSTRAINT ad_clicks_impressions_ad_id_fkey FOREIGN KEY (ad_id) REFERENCES public.ads(id) ON DELETE CASCADE;


--
-- Name: ad_clicks_impressions ad_clicks_impressions_place_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ad_clicks_impressions
    ADD CONSTRAINT ad_clicks_impressions_place_id_fkey FOREIGN KEY (place_id) REFERENCES public.places(id) ON DELETE CASCADE;


--
-- Name: ad_clicks_impressions ad_clicks_impressions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ad_clicks_impressions
    ADD CONSTRAINT ad_clicks_impressions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: ads ads_place_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ads
    ADD CONSTRAINT ads_place_id_fkey FOREIGN KEY (place_id) REFERENCES public.places(id) ON DELETE SET NULL;


--
-- Name: ads ads_provider_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ads
    ADD CONSTRAINT ads_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES public.providers(id) ON DELETE CASCADE;


--
-- Name: districts districts_province_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.districts
    ADD CONSTRAINT districts_province_id_fkey FOREIGN KEY (province_id) REFERENCES public.provinces(id) ON DELETE CASCADE;


--
-- Name: favorites favorites_place_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_place_id_fkey FOREIGN KEY (place_id) REFERENCES public.places(id) ON DELETE CASCADE;


--
-- Name: favorites favorites_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: loyalty_points_history loyalty_points_history_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.loyalty_points_history
    ADD CONSTRAINT loyalty_points_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: place_images place_images_place_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.place_images
    ADD CONSTRAINT place_images_place_id_fkey FOREIGN KEY (place_id) REFERENCES public.places(id) ON DELETE CASCADE;


--
-- Name: places places_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.places
    ADD CONSTRAINT places_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE RESTRICT;


--
-- Name: places places_province_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.places
    ADD CONSTRAINT places_province_id_fkey FOREIGN KEY (province_id) REFERENCES public.provinces(id) ON DELETE RESTRICT;


--
-- Name: review_images review_images_review_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review_images
    ADD CONSTRAINT review_images_review_id_fkey FOREIGN KEY (review_id) REFERENCES public.reviews(id) ON DELETE CASCADE;


--
-- Name: reviews reviews_place_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_place_id_fkey FOREIGN KEY (place_id) REFERENCES public.places(id) ON DELETE CASCADE;


--
-- Name: reviews reviews_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: trip_places trip_places_place_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trip_places
    ADD CONSTRAINT trip_places_place_id_fkey FOREIGN KEY (place_id) REFERENCES public.places(id) ON DELETE CASCADE;


--
-- Name: trip_places trip_places_trip_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trip_places
    ADD CONSTRAINT trip_places_trip_id_fkey FOREIGN KEY (trip_id) REFERENCES public.trips(id) ON DELETE CASCADE;


--
-- Name: trips trips_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trips
    ADD CONSTRAINT trips_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_checkins user_checkins_place_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_checkins
    ADD CONSTRAINT user_checkins_place_id_fkey FOREIGN KEY (place_id) REFERENCES public.places(id) ON DELETE CASCADE;


--
-- Name: user_checkins user_checkins_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_checkins
    ADD CONSTRAINT user_checkins_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: users users_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id);


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

