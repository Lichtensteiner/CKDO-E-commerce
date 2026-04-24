import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  fr: {
    translation: {
      header: {
        shop: 'Boutique',
        orders: 'Mes Commandes',
        cart: 'Panier',
        search: 'Rechercher un produit...',
      },
      ticker: {
        new_arrivals: 'Nouveautés Mobile',
      },
      home: {
        hero: {
          title: 'Vos courses livrées avec excellence.',
          subtitle: 'Découvrez la nouvelle façon de faire vos courses au Gabon.',
          cta: 'Découvrir nos rayons',
          stores: 'Nos magasins',
        },
        categories: {
          title: 'Rayons populaires',
          food: 'Alimentaire',
          fresh: 'Produits Frais',
          vegetables: 'Fruits & Légumes',
          frozen: 'Surgelés',
        },
        products: {
          title: 'En ce moment',
          view_all: 'Voir tout',
          promo: 'Promo',
        },
        mission: 'Notre Engagement',
        vision: 'Une Vision pour le Gabon.',
        mission_desc: 'Chez Ludo_Consulting, nous croyons que la technologie doit simplifier la vie. Notre mission est de transformer la façon dont vous accédez aux produits essentiels avec excellence.',
        mission_text: 'Offrir une plateforme de commerce fluide, sécurisée et ultra-rapide pour tous les Gabonais, partout et tout le temps.',
        values_title: 'Nos Valeurs',
        values_text: 'Transparence totale, respect des données utilisateurs et excellence dans le service client sont au cœur de notre ADN.',
        passionate: 'Passionné',
      },
      footer: {
        developer: 'Développement',
        company: "Contact de l'entreprise",
        location: 'Localisation',
        legal: 'Informations',
        view_map: 'Voir sur la carte',
        privacy: 'Confidentialité',
        terms: "Conditions d'utilisation",
        legal_notice: 'Mentions Légales',
        rights: 'Tous droits réservés.',
        powered_by: 'Propulsé par',
      }
    }
  },
  en: {
    translation: {
      header: {
        shop: 'Shop',
        orders: 'My Orders',
        cart: 'Cart',
        search: 'Search products...',
      },
      ticker: {
        new_arrivals: 'Mobile New Arrivals',
      },
      home: {
        hero: {
          title: 'Your groceries delivered with excellence.',
          subtitle: 'Discover the new way to shop in Gabon.',
          cta: 'Explore Departments',
          stores: 'Our stores',
        },
        categories: {
          title: 'Popular Departments',
          food: 'Groceries',
          fresh: 'Fresh Food',
          vegetables: 'Fruits & Veg',
          frozen: 'Frozen',
        },
        products: {
          title: 'Featured Products',
          view_all: 'View All',
          promo: 'Sale',
        },
        mission: 'Our Commitment',
        vision: 'A Vision for Gabon.',
        mission_desc: 'At Ludo_Consulting, we believe technology should simplify life. Our mission is to transform how you access essential products with excellence.',
        mission_text: 'Provide a seamless, secure, and ultra-fast commerce platform for all Gabonese, everywhere and always.',
        values_title: 'Our Values',
        values_text: 'Total transparency, respect for user data, and excellence in customer service are at the heart of our DNA.',
        passionate: 'Passionate',
      },
      footer: {
        developer: 'Development',
        company: 'Company Contact',
        location: 'Location',
        legal: 'Legal Info',
        view_map: 'View on map',
        privacy: 'Privacy',
        terms: 'Terms of Use',
        legal_notice: 'Legal Notice',
        rights: 'All rights reserved.',
        powered_by: 'Powered by',
      }
    }
  },
  es: {
    translation: {
      header: {
        shop: 'Tienda',
        orders: 'Mis pedidos',
        cart: 'Carrito',
        search: 'Buscar productos...',
      },
      ticker: {
        new_arrivals: 'Nuevos productos',
      },
      home: {
        hero: {
          title: 'Tus compras entregadas con excelencia.',
          subtitle: 'Descubre la nueva forma de comprar en Gabón.',
          cta: 'Explorar departamentos',
          stores: 'Nuestras tiendas',
        },
        categories: {
          title: 'Departamentos populares',
          food: 'Alimentación',
          fresh: 'Productos frescos',
          vegetables: 'Frutas y verduras',
          frozen: 'Congelados',
        },
        products: {
          title: 'En este momento',
          view_all: 'Ver todo',
          promo: 'Oferta',
        },
        mission: 'Nuestro compromiso',
        vision: 'Una visión para Gabón.',
        mission_desc: 'En Ludo_Consulting, creemos que la tecnología debe simplificar la vida. Nuestra misión es transformar cómo accedes a productos esenciales con excelencia.',
        mission_text: 'Ofrecer una plataforma de comercio fluida, segura y ultra rápida para todos los gaboneses, en cualquier lugar y en cualquier momento.',
        values_title: 'Nuestros valores',
        values_text: 'La transparencia total, el respeto por los datos de los usuarios y la excelencia en el servicio al cliente están en el centro de nuestro ADN.',
        passionate: 'Apasionado',
      },
      footer: {
        developer: 'Desarrollo',
        company: 'Contacto de la empresa',
        location: 'Ubicación',
        legal: 'Información legal',
        view_map: 'Ver en el mapa',
        privacy: 'Privacidad',
        terms: 'Condiciones de uso',
        legal_notice: 'Aviso legal',
        rights: 'Todos los derechos reservados.',
        powered_by: 'Desarrollado por',
      }
    }
  },
  ja: {
    translation: {
      header: {
        shop: 'ショップ',
        orders: '注文履歴',
        cart: 'カート',
        search: '商品を検索...',
      },
      ticker: {
        new_arrivals: '新着商品',
      },
      home: {
        hero: {
          title: '最高の品質でお届けする、あなたの買い物。',
          subtitle: 'ガボンでの新しい買い物の形を体験してください。',
          cta: '部門を見る',
          stores: '店舗案内',
        },
        categories: {
          title: '人気の部門',
          food: '食料品',
          fresh: '生鮮食品',
          vegetables: '青果',
          frozen: '冷凍食品',
        },
        products: {
          title: 'おすすめ商品',
          view_all: 'すべて見る',
          promo: 'セール',
        },
        mission: '私たちのコミットメント',
        vision: 'ガボンのためのビジョン。',
        mission_desc: 'Ludo_Consultingでは、テクノロジーが生活を簡素化すべきだと信じています。私たちの使命は、皆様が必要な製品にアクセスする方法を卓越したレベルで変革することです。',
        mission_text: 'すべてのガボン人に、いつでもどこでも、シームレスで安全、かつ超高速なコマースプラットフォームを提供します。',
        values_title: '私たちの価値観',
        values_text: '完全な透明性、ユーザーデータの尊重、そして顧客サービスの卓越性は、私たちのDNAの中核です。',
        passionate: '情熱的',
      },
      footer: {
        developer: '開発',
        company: '会社連絡先',
        location: '所在地',
        legal: '法的情報',
        view_map: '地図で見る',
        privacy: 'プライバシーポリシー',
        terms: '利用規約',
        legal_notice: '法的通知',
        rights: 'All rights reserved.',
        powered_by: 'Powered by',
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
