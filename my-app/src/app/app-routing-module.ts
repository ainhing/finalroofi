
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductComponent } from './pages/product/product';
import { Home } from './pages/home/home';
import { ProductDetail } from './pages/product-detail/product-detail';
import { Cart } from './pages/cart/cart';
import { Buynowcheckout } from './pages/buynowcheckout/buynowcheckout';
import { OrderConfirm } from './pages/order-confirm/order-confirm';
import { OrderHistory } from './pages/order-history/order-history';
import { Wishlist } from './pages/wishlist/wishlist';
import { About } from './pages/about/about';
import { Blog } from './pages/blog/blog';
import { BlogDetail } from './pages/blog-detail/blog-detail';
import { HotOffers } from './pages/hot-offers/hot-offers';
import { Qna } from './pages/qna/qna';
import { ForgotPassword } from './auth/forgot-password/forgot-password';
import { Login } from './auth/login/login';
import { Signup } from './auth/signup/signup';
import { ResetPassword } from './auth/reset-password/reset-password';
import { Privacy } from './layout/policy/privacy/privacy';
import { Return } from './layout/policy/return/return';
import { Shipping } from './layout/policy/shipping/shipping';
import { Terms } from './layout/policy/terms/terms';
import { UserProfile } from './pages/user-profile/user-profile';
import { AdminDashboard } from './pages/admin-dashboard/admin-dashboard';
import { AdminProfile } from './pages/admin-profile/admin-profile';
import { AdminProducts } from './pages/admin-products/admin-products';
import { AdminOrders } from './pages/admin-orders/admin-orders';
import { SavedVouchers } from './pages/saved-vouchers/saved-vouchers';
import { customerGuard, adminGuard } from './guards/auth.guard';
import { AdminProductFix } from './pages/admin-product-fix/admin-product-fix';
import { AdminBlog } from './pages/admin-blog/admin-blog';
import { Adminblogfix } from './pages/adminblogfix/adminblogfix';
import { Adminprofilefix } from './pages/adminprofilefix/adminprofilefix';
import { Adminordercheck } from './pages/adminordercheck/adminordercheck';


const routes: Routes = [
  { path: '', component: Home },
  { path: 'product', component: ProductComponent },
  { path: 'product-detail', component: ProductDetail },
  { path: 'product-detail/:id', component: ProductDetail },
  { path: 'cart', component: Cart },
  { 
    path: 'buynow-checkout', 
    component: Buynowcheckout,
    canActivate: [customerGuard] // Yêu cầu đăng nhập
  },
  { 
    path: 'order-confirm', 
    component: OrderConfirm,
    canActivate: [customerGuard] // Yêu cầu đăng nhập
  },
  { 
    path: 'order-history', 
    component: OrderHistory,
    canActivate: [customerGuard] // Yêu cầu đăng nhập
  },
  { 
    path: 'wishlist', 
    component: Wishlist,
    canActivate: [customerGuard]
  },
  { path: 'about', component: About },
  { path: 'blog', component: Blog },
  { path: 'blog/:slug', component: BlogDetail },
  { path: 'blog/:id', component: BlogDetail },
  { path: 'blog-detail', redirectTo: '/blog/5-thoi-quen-xanh-song-toi-gian', pathMatch: 'full' },
  { path: 'hot-offers', component: HotOffers },
  { path: 'qna', component: Qna },
  { 
    path: 'saved-vouchers',
    component: SavedVouchers,
    canActivate: [customerGuard]
  },
  
  // Auth routes
  { path: 'login', component: Login },
  { path: 'signup', component: Signup },
  { path: 'forgot-password', component: ForgotPassword },
  { path: 'reset-password', component: ResetPassword },
  
  // User routes (protected)
  { 
    path: 'profile', 
    component: UserProfile,
    canActivate: [customerGuard]
  },
  
  // Admin routes (protected)
  { 
    path: 'admin', 
    component: AdminDashboard,
    canActivate: [adminGuard]
  },
  { 
    path: 'admin/profile',
    component: AdminProfile,
    canActivate: [adminGuard]
  },
  { 
    path: 'admin/products',
    component: AdminProducts,
    canActivate: [adminGuard]
  },
  { 
    path: 'admin/products/fix/:id',
    component: AdminProductFix,
    canActivate: [adminGuard]
  },
  { 
    path: 'admin/blogs',
    component: AdminBlog,
    canActivate: [adminGuard]
  },
  { 
    path: 'admin/users',
    component: AdminProfile,
    canActivate: [adminGuard]
  },
  { 
    path: 'admin/users/fix/:id',
    component: Adminprofilefix,
    canActivate: [adminGuard]
  },
  { 
    path: 'admin/blogs/fix/:id',
    component: Adminblogfix,
    canActivate: [adminGuard]
  },
  { 
    path: 'admin/orders',
    component: AdminOrders,
    canActivate: [adminGuard]
  },
  { 
    path: 'admin/orders/fix/:id',
    component: Adminordercheck,
    canActivate: [adminGuard]
  },

  // Policy routes
  { path: 'policy/privacy', component: Privacy },
  { path: 'policy/return', component: Return },
  { path: 'policy/shipping', component: Shipping },
  { path: 'policy/terms', component: Terms },

  // Catch-all route
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }