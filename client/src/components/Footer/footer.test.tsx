import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import Footer from '.';

const bottomLinks = [
  {
    title: 'footer.links.about',
    href: 'links:footer.about-url'
  },
  {
    title: 'footer.links.alumni',
    href: 'https://www.linkedin.com/school/free-code-camp/people/'
  },
  {
    title: 'footer.links.open-source',
    href: 'https://github.com/freeCodeCamp/'
  },
  {
    title: 'footer.links.shop',
    href: 'links:footer.shop-url'
  },
  {
    title: 'footer.links.support',
    href: 'links:footer.support-url'
  },
  {
    title: 'footer.links.sponsors',
    href: 'links:footer.sponsors-url'
  },
  {
    title: 'footer.links.honesty',
    href: 'links:footer.honesty-url'
  },
  {
    title: 'footer.links.coc',
    href: 'links:footer.coc-url'
  },
  {
    title: 'footer.links.privacy',
    href: 'links:footer.privacy-url'
  },
  {
    title: 'footer.links.tos',
    href: 'links:footer.tos-url'
  },
  {
    title: 'footer.links.copyright',
    href: 'links:footer.copyright-url'
  }
];

describe('<Footer />', () => {
  it('renders the footer bottom links', () => {
    render(<Footer />);

    expect(
      screen.getByRole('heading', { name: 'footer.our-nonprofit' })
    ).toBeInTheDocument();

    for (const { title, href } of bottomLinks) {
      expect(screen.getByRole('link', { name: title })).toHaveAttribute(
        'href',
        href
      );
    }
  });

  it('renders no links other than the bottom links', () => {
    render(<Footer />);

    expect(screen.getAllByRole('link')).toHaveLength(bottomLinks.length);
  });
});
