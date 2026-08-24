import React from 'react';
import { useTranslation } from 'react-i18next';

import { Link } from '../helpers';
import './footer.css';

function Footer(): JSX.Element {
  const { t } = useTranslation();

  return (
    <footer className='site-footer'>
      <div className='footer-bottom'>
        <h2 className='col-header'>{t('footer.our-nonprofit')}</h2>
        <div className='our-nonprofit'>
          <Link external={false} to={t('links:footer.about-url')}>
            {t('footer.links.about')}
          </Link>
          <Link
            external={false}
            sameTab={false}
            to={'https://www.linkedin.com/school/free-code-camp/people/'}
          >
            {t('footer.links.alumni')}
          </Link>
          <Link external={false} to={'https://github.com/freeCodeCamp/'}>
            {t('footer.links.open-source')}
          </Link>
          <Link
            external={false}
            sameTab={false}
            to={t('links:footer.shop-url')}
          >
            {t('footer.links.shop')}
          </Link>
          <Link external={false} to={t('links:footer.support-url')}>
            {t('footer.links.support')}
          </Link>
          <Link external={false} to={t('links:footer.sponsors-url')}>
            {t('footer.links.sponsors')}
          </Link>
          <Link external={false} to={t('links:footer.honesty-url')}>
            {t('footer.links.honesty')}
          </Link>
          <Link external={false} to={t('links:footer.coc-url')}>
            {t('footer.links.coc')}
          </Link>
          <Link external={false} to={t('links:footer.privacy-url')}>
            {t('footer.links.privacy')}
          </Link>
          <Link external={false} to={t('links:footer.tos-url')}>
            {t('footer.links.tos')}
          </Link>
          <Link external={false} to={t('links:footer.copyright-url')}>
            {t('footer.links.copyright')}
          </Link>
        </div>
      </div>
    </footer>
  );
}

Footer.displayName = 'Footer';
export default Footer;
