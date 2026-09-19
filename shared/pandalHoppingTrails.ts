/**
 * Auto-generates pandal-hopping route URLs for each section of Kolkata.
 *
 * Takes the top N pandals by priority per section, builds a Google Maps
 * multi-stop directions URL, and returns a typed array of section trails.
 *
 * These are NOT GPS-verified routes — they're convenience links that
 * open Google Maps with waypoints pre-filled. Actual routing, traffic,
 * and reachability are handled by Google Maps on the user's device.
 */

import type { PandalRecord } from "./pujaData";

export type SectionTrail = {
  section: string;
  sectionBn: string;
  url: string;
  pandalCount: number;
  pandalNames: string[];
  distanceText?: string;
};

const SECTION_BN: Record<string, string> = {
  "Dumdum Area": "দমদম এলাকা",
  "North and Central Kolkata": "উত্তর ও মধ্য কলকাতা",
  "Khidirpur area": "খিদিরপুর এলাকা",
  "Behala area": "বেহালা এলাকা",
  "Southern part of Kolkata": "দক্ষিণ কলকাতার অঞ্চল",
  "Salt Lake & New Town": "সল্টলেক ও নিউ টাউন",
  "Bonedi Bari Heritage Trail": "বনেদি বাড়ি ঐতিহ্যময় ট্রেইল",
  "North Kolkata": "উত্তর কলকাতা",
  "South Kolkata": "দক্ষিণ কলকাতা",
  "Central Kolkata": "মধ্য কলকাতা",
  "East Kolkata": "পূর্ব কলকাতা",
  "West Kolkata": "পশ্চিম কলকাতা",
  "Salt Lake": "সল্ট লেক",
  "New Town": "নিউ টাউন",
};

const PRIORITY_RANK: Record<string, number> = { S: 1, A: 2, B: 3, C: 4 };

/**
 * Curated Pandal-Hopping Routes with exact waypoint coordinates and distance estimates.
 */
const CURATED_ROUTES: SectionTrail[] = [
  {
    section: "Dumdum Area",
    sectionBn: "দমদম এলাকা",
    distanceText: "15 km",
    pandalCount: 16,
    pandalNames: ["Sreebhumi Sporting Club", "Patipukur Bokul Durga Puja", "Natunpally Pradeep Sangha", "Lake Town Adhibasi Brinda", "Dum Dum Mall Palli", "Dum Dum Park Tarun Sangha", "Dum Dum Park Tarun Dal", "Dum Dum Park Bharat Chakra", "Dum Dum Park Sarbojanin", "Dum Dum Park Yubak Brinda", "Ultadanga Sangrami", "Jagorani Sangha", "Telengabagan", "Pallysree", "Yuba Brinda", "Gauri Bari"],
    url: "https://www.google.com/maps/dir/Sreebhumi+Durga+Puja+Pandal/Patipukur+Bokul+Durga+Puja+Bari,+316,+Chowdhuri+Bagan,+Patipukur,+South+Dumdum,+West+Bengal+700048/Natunpally+Pradeep+Sangha,+26,+Ghoshpara,+Patipukur,+South+Dumdum,+West+Bengal+700048/Lake+Town+Adhibasi+Brinda,+Children's+Park,+Lake+Town+Rd,+Block+A,+Lake+Town,+South+Dumdum,+West+Bengal+700089/Dum+Dum+Mall+Palli+Sarbojanin+Durga+Puja+Committee/Dum+Dum+Park+Tarun+Sangha/Dum+Dum+Park+Tarun+Dal/Dum+Dum+Park+Bharat+Chakra,+Tank+No.+2,+Dum+Dum+Park,+South+Dumdum,+West+Bengal+700055/Dum+Dum+Park+Sarbojanin+Durga+Puja+Samity,+225%2F1,+Dum+Dum+Park,+South+Dumdum,+West+Bengal+700055/Dum+Dum+Park+Yubak+Brinda/Ultadanga+Sangrami/JAGORANI+SANGHA+DURGA+PUJA+PANDAL,+16%2F1%2FH%2F48%2F1,+Murari+Pukur,+Ultadanga,+Kolkata,+West+Bengal+700067/Telengabagan+Durga+Puja+Ground/Pallysree+Durga+Puja+Ground,+1%2F1P,+Jaharlal+Dutta+Ln,+Muchibazer,+Daspara,+Ultadanga,+Kolkata,+West+Bengal+700067/Yuba+Brinda+DurgaPuja+Mandop,+H9WJ%2B9W8,+Daspara,+Ultadanga,+Kolkata,+West+Bengal+700067/Gauri+Bari+Sarbojanin+Durga+Puja+Pandal,+700067,+4,+Gouri+Bari+Ln,+Manicktala,+Gouri+Bari,+Kolkata,+West+Bengal+700004/@22.6034073,88.3892044,15z/data=!4m97!4m96!1m5!1m1!1s0x3a02760813abc4eb:0xf902791508168785!2m2!1d88.4027814!2d22.5990559!1m5!1m1!1s0x3a02760790fdb305:0xe060dc9859e24e4b!2m2!1d88.4008178!2d22.6020774!1m5!1m1!1s0x3a027606a25cfd9f:0x36a5c4ca387f948d!2m2!1d88.3969784!2d22.6030605!1m5!1m1!1s0x3a0275fdccbfa703:0x34f93ea72ee93339!2m2!1d88.4039701!2d22.6044508!1m5!1m1!1s0x39f89e00c1035271:0x851880850fe9fdfa!2m2!1d88.4029114!2d22.6167333!1m5!1m1!1s0x3a0275f789123901:0x5dc60430b7ee55a9!2m2!1d88.4137848!2d22.6109224!1m5!1m1!1s0x3a0275f59de26db9:0x364e453a8f73de39!2m2!1d88.4186263!2d22.6114958!1m5!1m1!1s0x3a0275f638219271:0x3974eb6bb6cbe800!2m2!1d88.4146001!2d22.6108213!1m5!1m1!1s0x3a0275f5d410ed31:0xe23f982d56f9571e!2m2!1d88.4164052!2d22.6094363!1m5!1m1!1s0x3a0275f393fc8ae9:0x86071d175b9e6f0d!2m2!1d88.4178014!2d22.6055458!1m5!1m1!1s0x3a02760d13f18a29:0x1a35ba2c05e6c943!2m2!1d88.3950912!2d22.5906046!1m5!1m1!1s0x3a0277ad1e63f327:0xaf50f6fc071645e7!2m2!1d88.3848974!2d22.5929868!1m5!1m1!1s0x3a027616916b4d11:0xd0ce297062cedffc!2m2!1d88.3853354!2d22.5949299!1m5!1m1!1s0x3a027616f60a6ef1:0xc26fae12f52ac05!2m2!1d88.3846882!2d22.5957731!1m5!1m1!1s0x3a0277e7348b79fd:0x649ad17e7c14bf3e!2m2!1d88.3823254!2d22.5959122!1m5!1m1!1s0x3a02763c2ff55cf3:0x3b115d3e0b47dc81!2m2!1d88.3790856!2d22.5944124",
  },
  {
    section: "North and Central Kolkata",
    sectionBn: "উত্তর ও মধ্য কলকাতা",
    distanceText: "14 km",
    pandalCount: 21,
    pandalNames: ["Ladies Park", "Taltala Sarbojanin", "Santosh Mitra Square", "Sealdah Railway Athletic", "College Square", "Md Ali Park", "Simla Byayam Samity", "Chaltabagan", "Hedua Park", "Kashi Bose Lane", "Hatibagan Sarbojanin", "Nalin Sarkar Street", "Hati Bagan Nabinpally", "Sikdar Bagan", "Sovabazar Rajbari", "Jagat Mukherjee Park", "Bagbazar Sarbojonin", "Kumartuli Sarbojanin", "Kumartuli Park", "Ahiritola Sarbojanin", "Ahiritola Jubak Brinda"],
    url: "https://www.google.co.in/maps/dir/Ladies+Park+Durga+Puja+Mandap/Taltala+Sarbojanin+Kalipuja+O+Onnokut+Mohotshob+Committee/Santosh+Mitra+Square/Sealdah+Railway+Athletic+Club/College+square+puja+mandap/Md+ali+park+durga+pujo/Simla+Byayam+Samity+Durga+Puja/Chaltabagan+Durga+Puja+Pandal/Hedua+Park+Durga+Puja/Kashi+Bose+Lane+Durga+Puja+Samity/Hatibagan+Sarbojanin+Durgotsav/NALIN+SARKAR+STREET+SARBOJONIN+DURGOTSAB/Hati+Bagan+Nabinpally/Sikdar+Bagan+Sadharan+Durgotsov/Sovabazar+Rajbarir+Puja/Jagat+Mukherjee+Park/Bagbazar+Sarbojonin+Durgo+Utsov/Kumartuli+Sarbojanin+Durgotsab/Kumartuli+Park/Ahiritola+Sarbojanin+Durgotsab/Ahiritola+Jubak+Brinda+Durgapuja/@22.5765953,88.3447547,14z/data=!3m1!4b1!4m128!4m127!1m5!1m1!1s0x3a0276e5aef8032f:0xeee792f952456af2!2m2!1d88.370484!2d22.548524!1m5!1m1!1s0x3a0276fe0dd5c879:0xb2e9bfae855a53a1!2m2!1d88.3649144!2d22.5607303!1m5!1m1!1s0x3a027655a41c9633:0xd230742cc8f8580b!2m2!1d88.3656532!2d22.5660201!1m5!1m1!1s0x3a027650a397390d:0x78172af37c615acf!2m2!1d88.37194!2d22.5705774!1m5!1m1!1s0x3a0277f855b8772d:0xebfd1e10c9feb763!2m2!1d88.3644724!2d22.5745279!1m5!1m1!1s0x3a02777157391ea3:0x7e5ea687b561d1dd!2m2!1d88.3605089!2d22.5778289!1m5!1m1!1s0x3a02764afedbe4f7:0x1968f88ab9298ba1!2m2!1d88.3649714!2d22.5851141!1m5!1m1!1s0x3a0276487df7aa3b:0x2a77b76847094cd1!2m2!1d88.3721504!2d22.5851192!1m5!1m1!1s0x3a0276363b072bbf:0x61e0bafbbf748855!2m2!1d88.369288!2d22.5887151!1m5!1m1!1s0x3a027636f4aba21b:0xd56a6b40b1520547!2m2!1d88.3689174!2d22.5908979!1m5!1m1!1s0x3a027630b1e30443:0x78837359e84d7bc7!2m2!1d88.3720004!2d22.5943863!1m5!1m1!1s0x3a02771350a7a0b5:0xc5b3df0676ff5334!2m2!1d88.373482!2d22.5943089!1m5!1m1!1s0x3a02763a5b8b45d1:0xb8f853c804378498!2m2!1d88.3735008!2d22.5959608!1m5!1m1!1s0x3a02763080f07907:0x4da319313d021494!2m2!1d88.3723112!2d22.5966234!1m5!1m1!1s0x3a02777b2c65da0f:0x9cce380150665ca4!2m2!1d88.3683007!2d22.5956703!1m5!1m1!1s0x3a02763275b71687:0xd927b406f878b566!2m2!1d88.3660388!2d22.5994903!1m5!1m1!1s0x3a02762db2c7e01f:0xa953c72eb79fcf18!2m2!1d88.3659778!2d22.6046649!1m5!1m1!1s0x3a0277cd67c8e155:0x3df7550f3d6f08ff!2m2!1d88.3626231!2d22.6012662!1m5!1m1!1s0x3a0277cd636f29f3:0x76a486a0b70b04b7!2m2!1d88.3614663!2d22.5989827!1m5!1m1!1s0x3a0277cc02940a43:0x8ca24d6395b37972!2m2!1d88.3571768!2d22.594859!1m5!1m1!1s0x3a0277c930c7cc33:0xea6f68a88f544b3!2m2!1d88.3603287!2d22.594593!3e2",
  },
  {
    section: "Khidirpur area",
    sectionBn: "খিদিরপুর এলাকা",
    distanceText: "2.5 km",
    pandalCount: 10,
    pandalNames: ["Khidirpur 25 Palli", "74 Pally Club", "Kidderpore Milan Sangha", "Udayan Kidderpore", "Khidderpore Pally Saradiya", "Khidderpore Nabarag", "Kidderpore Mahabir Bayam", "75 Pally Khidderpore", "Kidderpore Sarbojanin", "Venus Club"],
    url: "https://www.google.co.in/maps/dir/Khidirpur+25+Palli+Durga+Puja,+1+b,+700023,+10,+Gopal+Ghosh+Lane,+Kidderpore,+Kolkata,+West+Bengal+700023/74+Pally+Club,+5B,+Monilal+Banerjee+Rd,+Kidderpore,+Kolkata,+West+Bengal+700023/Kidderpore+Milan+Sangha+Club,+G8RF%2BC7X,+Michael+Madhusudan+Sarani,+Kidderpore,+Kolkata,+West+Bengal+700023/Udayan+Kidderpore,+Hem+Chandra+St,+Andaman+Dock,+Kidderpore,+Kolkata,+West+Bengal+700023/Khidderpore+Pally+Saradiya,+16A,+Hem+Chandra+St,+Kidderpore,+Kolkata,+West+Bengal+700023/Khidderpore+Nabarag,+30A,+Kidderpore,+Kolkata,+West+Bengal+700023/Kidderpore+Mahabir+Bayam+Samity+(+Akra+Mandir+),+G8RC%2BF6G,+Gopal+Doctor+Rd,+Andaman+Dock,+Kidderpore,+Kolkata,+West+Bengal+700023/75+Pally+Khidderpore,+11C,+Khidderpore,+Ramanath+Pal+Rd,+Kidderpore,+Kolkata,+West+Bengal+700023/KIDDERPORE+SARBOJANIN+DURGOTSAB,+G8QF%2BHXF,+Mansatala+Row,+Kidderpore,+Kolkata,+West+Bengal+700023/Venus+Club,+441b,+Manasatala+Ln,+Kidderpore,+Kolkata,+West+Bengal+700023/@22.541737,88.3387271,15z/data=!4m62!4m61!1m5!1m1!1s0x3a02775e35d2c843:0x53aef6bef9750524!2m2!1d88.3264565!2d22.5391961!1m5!1m1!1s0x3a0277607577297f:0x49f4c63c8f2b7292!2m2!1d88.3252173!2d22.5396498!1m5!1m1!1s0x3a0279df93b0e86b:0xea0fea73db69f458!2m2!1d88.3232378!2d22.5411074!1m5!1m1!1s0x3a0279dedfc2c12f:0xd3184f480e2613f6!2m2!1d88.3214183!2d22.5441609!1m5!1m1!1s0x3a0279de55bc9fb1:0x982082f962201187!2m2!1d88.3215203!2d22.5432501!1m5!1m1!1s0x3a0279de4dceaaab:0x270a591cc9f2c98!2m2!1d88.3212645!2d22.5417092!1m5!1m1!1s0x3a0279de40b44279:0x69922669d0fa33cf!2m2!1d88.320577!2d22.5411946!1m5!1m1!1s0x3a0279de1f6ee7b5:0x7cf2bbf2cc8db51f!2m2!1d88.3204994!2d22.5402761!1m5!1m1!1s0x3a02775fe620fa65:0x8fc665fef5c669b!2m2!1d88.324934!2d22.5389383!1m5!1m1!1s0x3a0277e41c1836f9:0x4df215465e9b6868!2m2!1d88.3269229!2d22.5381681!3e2",
  },
  {
    section: "Behala area",
    sectionBn: "বেহালা এলাকা",
    distanceText: "14 km",
    pandalCount: 18,
    pandalNames: ["Tricone Park", "Mudiali Club", "Shiv Mandir", "Samaj Sebi Sangha", "Ballygunge Cultural", "Deshapriya Park", "Tridhara Sammilani", "Triangular Park", "Hindustan Park", "Hindustan Club", "Singhi Park", "Falguni Sangha", "Ekdalia Evergreen", "Bosepukur Sitala Mandir", "Sunil Nagar Club", "68 Palli", "Maddox Square", "64 Pally"],
    url: "https://www.google.co.in/maps/dir/Tricone+Park/Mudiali+Club/Shiv+Mandir+Sarbajanin+Durgapuja/Samaj+Sebi+Sangha/Ballygunge+Cultural+Association/Deshapriya+Park/Tridhara+Sammilani/Triangular+Park/Hindustan+Park+Sarbojanin+Durga+Puja/Hindustan+Club+Durga+Puja/Singhi+Park+Durga+Puja/Falguni+Sangha/%E0%A6%8F%E0%A6%95%E0%A6%A1%E0%A6%BE%E0%A6%B2%E0%A6%BF%E0%A6%AF%E0%A6%BE+%E0%A6%8F%E0%A6%AD%E0%A6%BE%E0%A6%B0%E0%A6%97%E0%A7%8D%E0%A6%B0%E0%A7%80%E0%A6%A8+%E0%A6%95%E0%A7%8D%E0%A6%B2%E0%A6%BE%E0%A6%AB/Bosepukur+Sitala+Mandir/Sunil+Nagar+Club/68+Palli+Athletic+Club/Maddox+Square+Durga+Puja/%E0%A7%AC%E0%A7%AA+%E0%A6%AA%E0%A6%B2%E0%A7%8D%E0%A6%B2%E0%A7%80+%E0%A6%A6%E0%A7%81%E0%A6%B0%E0%A7%8D%E0%A6%97%E0%A6%BE+%E0%A6%AA%E0%A7%81%E0%A6%9C%E0%A7%8B/@22.5213463,88.3602198,15z/data=!4m110!4m109!1m5!1m1!1s0x3a0270cb1d1a6955:0x2df0cb98705cfbb5!2m2!1d88.3447357!2d22.5134551!1m5!1m1!1s0x3a0270cbdf5173cd:0x5518c1c09c9335f0!2m2!1d88.3463137!2d22.5102079!1m5!1m1!1s0x3a0270cc22a8e9fd:0x1fc4052572d96152!2m2!1d88.3498502!2d22.5109967!1m5!1m1!1s0x3a0270d322d57e03:0xfad4d78a9e3e88f9!2m2!1d88.3559336!2d22.5155613!1m5!1m1!1s0x3a0270d32a98b68d:0x871af557cf56660e!2m2!1d88.3557435!2d22.5159227!1m5!1m1!1s0x3a027761da29a45d:0x9da1834309e5d8aa!2m2!1d88.3534607!2d22.5185819!1m5!1m1!1s0x3a02772daca1f653:0xdbf590e266b01219!2m2!1d88.3554398!2d22.5195286!1m5!1m1!1s0x3a02772b7b1ee021:0x16f6fa3d06146c88!2m2!1d88.358322!2d22.518484!1m5!1m1!1s0x3a02772abd79b277:0x409d5820e3eed34f!2m2!1d88.3620331!2d22.5176479!1m5!1m1!1s0x3a0277bd04edc269:0xa73df4e6c5f7bb98!2m2!1d88.3607602!2d22.5202231!1m5!1m1!1s0x3a0276d5f6fa97af:0x310ce7fdfb83ca22!2m2!1d88.3632471!2d22.5208425!1m5!1m1!1s0x3a0276d42883b4ed:0x9c55995e6e6eb509!2m2!1d88.3656673!2d22.5220333!1m5!1m1!1s0x3a0276d417b26201:0x220c3a4dbd7f651a!2m2!1d88.3665629!2d22.5212187!1m5!1m1!1s0x3a0276b4fd6fec85:0xb383d0cf7fdb6bc8!2m2!1d88.3848598!2d22.5191725!1m5!1m1!1s0x3a0276b9d56f9157:0xbbb5012bd180a27b!2m2!1d88.3847328!2d22.5284199!1m5!1m1!1s0x3a0276da25d461b9:0x2cb03e9ea2a3773d!2m2!1d88.3674169!2d22.5293269!1m5!1m1!1s0x3a02772554053a63:0x257b3f0f56afec64!2m2!1d88.3546477!2d22.5265634!1m5!1m1!1s0x3a0277346d4d65c1:0xd3868d29d4cee885!2m2!1d88.3475801!2d22.5205584!3e2",
  },
  {
    section: "Southern part of Kolkata",
    sectionBn: "দক্ষিণ কলকাতার অঞ্চল",
    distanceText: "21 km",
    pandalCount: 25,
    pandalNames: ["Behala 29th Pally", "Buroshibtala Durga Utsab", "Behala Buroshibtala Janakalyan", "Behala Friends", "Adarsha Pally", "Behala Nutan Dal", "Jagrihi Club", "Barisha Tarun Tirtha", "Purba Barisha Shitalatala", "Barisha Club", "Barisha Tapoban", "State Bank Park", "Thakurpukur Club", "Barisha Sarbojonin", "Barisha Yubak Brinda", "Netaji Sangha", "Parnasree Palli", "Mukul Sangha", "Behala Debdaru Fatak", "Behala Jatiya Sangha"],
    url: "https://www.google.co.in/maps/dir/Behala+29th+Pally+Club,+19,+SN+Roy+Rd,+Sahapur,+New+Alipore,+Kolkata,+West+Bengal+700038/Buroshibtala+Durga+Utsab,+10,+MMB+Rd,+Buroshibtalla,+Behala,+Kolkata,+West+Bengal+700038/Behala+Buroshibtala+Janakalyan+Sangha,+661,+Manmohan+Banerjee+Rd,+Buroshibtalla,+Behala,+Kolkata,+West+Bengal+700038/Behala+Friends'+Club,+1%2F9,+Behala+Tram+Depot+Exit,+Diamond+Harbour+Rd,+Jele+Para,+Behala,+Kolkata,+West+Bengal+700034/Adarsha+Pally,+165,+Roy+Bahadur+Rd,+near+Union+Drug+Company+Ltd,+Buroshibtalla,+Behala,+Kolkata,+West+Bengal+700038/Behala+Nutan+Dal,+16,+Sashi+Bhushan+Mukerjee+Rd,+Auddy+Bagan+Basti,+Behala,+Kolkata,+West+Bengal+700034/Jagrihi+Club,+36%2F1,+24,+Nabalia+Para+Rd,+Barisha,+Kolkata,+West+Bengal+700008/Barisha+Tarun+Tirtha+Club,+41,+3,+Kalipada+Mukherjee+Rd,+Sakher+Bazar,+Barisha,+Kolkata,+West+Bengal+700008/Purba+Barisha+Shitalatala+Kishore+Sangha,+F8JC%2B9JG,+East+Park,+Barisha,+Kolkata,+West+Bengal+700008/Barisha+Club+Puja+Ground+and+Community+Hall,+50,+Santosh+Roy+Rd,+Sakher+Bazar,+Purba+Barisha,+Kolkata,+West+Bengal+700008/Barisha+Tapoban+Club,+Chandi+Charan+Ghosh+Rd,+Silpara,+Purba+Barisha,+Kolkata,+West+Bengal+700008/State+Bank+Park,+Nabapally,+Kolkata,+West+Bengal+700063/Thakurpukur+Club+Durga+Puja,+889,+Padma+Pukur,+Paschim+Barisha,+Kolkata,+West+Bengal+700063/Barisha+Sarbojonin,+35,+K+K+Roychowdhury+Rd,+Subodh+Pally,+Paschim+Barisha,+Kolkata,+West+Bengal+700008/Barisha+Yubak+Brinda+Club,+13%2F4,+Biren+Roy+Road+W,+Behala+Chowrasta,+Sakher+Bazar,+Paschim+Barisha,+Kolkata,+West+Bengal+700008/Netaji+Sangha+Club,+P,+44,+Parui+Pucca+Rd,+Bakultala,+Behala,+Kolkata,+West+Bengal+700061/Jagarani+Club/Parnasree+Palli,+Behala,+Kolkata,+West+Bengal+700060/Yubak+Brinda+Club/Mukul+Sangha+Club,+28,+Gabtala+Lane,+20,+Gabtala+Ln,+Behala,+Kolkata,+West+Bengal+700060/Behala+Debdaru+Fatak+Club,+2A,+Arya+Samity+Rd,+Panchanan+Tala,+Behala,+Kolkata,+West+Bengal+700034/Behala+Jatiya+Sangha,+23,+5,+Banamali+Naskar+Rd,+Opp.+Behala+Thana,+Panchanan+Tala,+Behala,+Kolkata,+West+Bengal+700060/Behala+Jatiya+Sangha,+23,+5,+Banamali+Naskar+Rd,+Opp.+Behala+Thana,+Panchanan+Tala,+Behala,+Kolkata,+West+Bengal+700060/Behala+Jatiya+Sangha,+23,+5,+Banamali+Naskar+Rd,+Opp.+Behala+Thana,+Panchanan+Tala,+Behala,+Kolkata,+West+Bengal+700060/Behala+Jatiya+Sangha,+23,+5,+Banamali+Naskar+Rd,+Opp.+Behala+Thana,+Panchanan+Tala,+Behala,+Kolkata,+West+Bengal+700060/@22.4877818,88.3137509,14z/data=!4m152!4m151!1m5!1m1!1s0x3a0270a8353807c1:0xbd6435d02b80ba71!2m2!1d88.3228571!2d22.5071676!1m5!1m1!1s0x3a027123dcee0175:0xd996d45bdf2bd714!2m2!1d88.3303155!2d22.5041847!1m5!1m1!1s0x3a0270a8a8740ab5:0x9752be95a659d5f4!2m2!1d88.3303963!2d22.5042511!1m5!1m1!1s0x3a027a0ef9bcd14d:0x73e8aabbc63c45a2!2m2!1d88.3198079!2d22.5013531!1m5!1m1!1s0x3a0270a6935d64b9:0xa1ef113ea8156a6a!2m2!1d88.3277164!2d22.4998455!1m5!1m1!1s0x3a027a091884e2f5:0xeda7dc93f955e9f4!2m2!1d88.3202427!2d22.500221!1m5!1m1!1s0x3a027a7167aca78f:0x7f0ea6c42316ca9b!2m2!1d88.3174966!2d22.4855883!1m5!1m1!1s0x3a027a76b80ea4fb:0xf5c5bb51ee554158!2m2!1d88.3192714!2d22.484458!1m5!1m1!1s0x3a027a779d6c523f:0x53b744094c8b3c85!2m2!1d88.3215658!2d22.4809324!1m5!1m1!1s0x3a027a6fe9697123:0xe1530cae4fe5b431!2m2!1d88.3132412!2d22.4812859!1m5!1m1!1s0x3a027a6440b1d2ad:0x3fbecfcc9e538826!2m2!1d88.3105132!2d22.4764394!1m5!1m1!1s0x3a027a89faa1fe79:0xc53f17d75ebec792!2m2!1d88.3099592!2d22.4672787!1m5!1m1!1s0x3a027b5070b6428f:0x331cfef0da5b0a2!2m2!1d88.3075694!2d22.4667801!1m5!1m1!1s0x3a027a68a113ecfb:0xda8048281915bda3!2m2!1d88.3081226!2d22.4798276!1m5!1m1!1s0x3a027b00443954a7:0x3a68ba36d0a2d50f!2m2!1d88.3120786!2d22.4862558!1m5!1m1!1s0x3a027a43d9dfeb35:0xf2d9b8befa8de71f!2m2!1d88.3014486!2d22.4855359!1m5!1m1!1s0x3a027a17bc03ae7f:0x9697e2206c730854!2m2!1d88.3063384!2d22.501869!1m5!1m1!1s0x3a027a180372f295:0xd4937b0714f6212f!2m2!1d88.3051657!2d22.5105942!1m5!1m1!1s0x3a027a1b17be843b:0xa43e435b7c45f3e!2m2!1d88.3129036!2d22.5076341!1m5!1m1!1s0x3a027a0ffe30bf93:0x2fa0f3e7a7dd0027!2m2!1d88.3142072!2d22.5035963!1m5!1m1!1s0x3a027a0f6b5d5c9b:0x26aa097527002108!2m2!1d88.3177822!2d22.5023836!1m5!1m1!1s0x3a027bbba01f8deb:0xa3b0a26f4ecdcf2!2m2!1d88.3177245!2d22.5044577!1m5!1m1!1s0x3a027bbba01f8deb:0xa3b0a26f4ecdcf2!2m2!1d88.3177245!2d22.5044577!1m5!1m1!1s0x3a027bbba01f8deb:0xa3b0a26f4ecdcf2!2m2!1d88.3177245!2d22.5044577!1m5!1m1!1s0x3a027bbba01f8deb:0xa3b0a26f4ecdcf2!2m2!1d88.3177245!2d22.5044577!3e2",
  },
];

/**
 * Builds a Google Maps multi-stop URL from a list of pandals.
 */
function buildGoogleMapsUrl(pandals: PandalRecord[]): string {
  if (pandals.length === 0) return "";
  if (pandals.length === 1) {
    const p = pandals[0];
    return `https://www.google.com/maps/dir/?api=1&destination=${p.latitude},${p.longitude}`;
  }

  const origin = pandals[0];
  const destination = pandals[pandals.length - 1];
  const waypoints = pandals.slice(1, -1);

  let url = `https://www.google.com/maps/dir/?api=1`;
  url += `&origin=${origin.latitude},${origin.longitude}`;
  url += `&destination=${destination.latitude},${destination.longitude}`;
  if (waypoints.length > 0) {
    url += `&waypoints=${waypoints.map((p) => `${p.latitude},${p.longitude}`).join("|")}`;
  }
  url += `&travelmode=driving`;
  return url;
}

/**
 * Generates pandal-hopping trails combining curated regional routes and auto-generated trails.
 */
export function generateSectionTrails(
  pandals: PandalRecord[],
  options: { maxPerSection?: number } = {},
): SectionTrail[] {
  // Always return curated routes first
  const trails: SectionTrail[] = [...CURATED_ROUTES];

  // Also auto-generate sections if available
  const maxPerSection = options.maxPerSection ?? 5;
  const bySection = new Map<string, PandalRecord[]>();
  for (const p of pandals) {
    if (!p.section || p.latitude === 0 || p.longitude === 0) continue;
    if (!Number.isFinite(p.latitude) || !Number.isFinite(p.longitude)) continue;
    const group = bySection.get(p.section) ?? [];
    group.push(p);
    bySection.set(p.section, group);
  }

  for (const [section, group] of Array.from(bySection.entries())) {
    if (trails.some((t) => t.section.toLowerCase() === section.toLowerCase())) continue;
    const sorted = group.sort((a: PandalRecord, b: PandalRecord) => {
      const pa = PRIORITY_RANK[a.priority ?? "C"] ?? 4;
      const pb = PRIORITY_RANK[b.priority ?? "C"] ?? 4;
      if (pa !== pb) return pa - pb;
      return (a.userRank ?? 999) - (b.userRank ?? 999);
    });

    const selected = sorted.slice(0, maxPerSection);
    if (selected.length < 2) continue;

    trails.push({
      section,
      sectionBn: SECTION_BN[section] ?? section,
      url: buildGoogleMapsUrl(selected),
      pandalCount: selected.length,
      pandalNames: selected.map((p: PandalRecord) => p.name),
    });
  }

  return trails;
}
