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
      home: {
        hero: {
          title: 'Vos courses livrées avec excellence.',
          subtitle: 'Découvrez la nouvelle façon de faire vos courses au Gabon.',
          cta: 'Découvrir nos rayons',
        },
        mission: 'Notre Engagement',
        vision: 'Une Vision pour le Gabon.',
        mission_desc: 'Chez Ludo_Consulting, nous croyons que la technologie doit simplifier la vie. Notre mission est de transformer la façon dont vous accédez aux produits essentiels avec excellence.',
      },
      footer: {
        developer: 'Développement',
        company: "Contact de l'entreprise",
        location: 'Localisation',
        legal: 'Informations',
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
      home: {
        hero: {
          title: 'Your groceries delivered with excellence.',
          subtitle: 'Discover the new way to shop in Gabon.',
          cta: 'Explore Departments',
        },
        mission: 'Our Commitment',
        vision: 'A Vision for Gabon.',
        mission_desc: 'At Ludo_Consulting, we believe technology should simplify life. Our mission is to transform how you access essential products with excellence.',
      },
      footer: {
        developer: 'Development',
        company: 'Company Contact',
        location: 'Location',
        legal: 'Legal Info',
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
      home: {
        hero: {
          title: 'Tus compras entregadas con excelencia.',
          subtitle: 'Descubre la nueva forma de comprar en Gabón.',
          cta: 'Explorar departamentos',
        },
        mission: 'Nuestro compromiso',
        vision: 'Una visión para Gabón.',
        mission_desc: 'En Ludo_Consulting, creemos que la tecnología debe simplificar la vida. Nuestra misión es transformar cómo accedes a productos esenciales con excelencia.',
      },
      footer: {
        developer: 'Desarrollo',
        company: 'Contacto de la empresa',
        location: 'Ubicación',
        legal: 'Información legal',
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
      home: {
        hero: {
          title: '最高の品質でお届けする、あなたの買い物。',
          subtitle: 'ガボンでの新しい買い物の形を体験してください。',
          cta: '部門を見る',
        },
        mission: '私たちのコミットメント',
        vision: 'ガボンのためのビジョン。',
        mission_desc: 'Ludo_Consultingでは、テクノロジーが生活を簡素化すべきだと信じています。私たちの使命は、皆様が必要な製品にアクセスする方法を卓越したレベルで変革することです。',
      },
      footer: {
        developer: '開発',
        company: '会社連絡先',
        location: '所在地',
        legal: '法的情報',
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
