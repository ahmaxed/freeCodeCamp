import csurf from 'csurf';

export default function() {
  const protection = csurf({
    cookie: {
      domain: process.env.COOKIE_DOMAIN || 'localhost'
    }
  });
  // Note: paypal webhook goes through /internal
  return function csrf(req, res, next) {
    const pathArr = req.path.split('/');
    if (/(^api$|^unauthenticated$|^internal$|^p$)/.test(pathArr[1])) {
      return next();
    }
    if (/(^donate$)/.test(pathArr[1]) && /(^update-paypal$)/.test(pathArr[2])) {
      return next();
    }
    return protection(req, res, next);
  };
}
