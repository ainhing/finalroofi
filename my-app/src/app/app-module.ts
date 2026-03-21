import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule, CurrencyPipe, LowerCasePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { Header } from './layout/header/header';
import { Footer } from './layout/footer/footer';
import { Home } from './pages/home/home';
import { ProductComponent } from './pages/product/product';
import { ProductDetail } from './pages/product-detail/product-detail';
import { Cart } from './pages/cart/cart';
import { OrderConfirm } from './pages/order-confirm/order-confirm';
import { OrderHistory } from './pages/order-history/order-history';
import { Wishlist } from './pages/wishlist/wishlist';
import { About } from './pages/about/about';
import { Blog } from './pages/blog/blog';                     // KHÔNG standalone
import { BlogDetail } from './pages/blog-detail/blog-detail'; // Là standalone
import { HotOffers } from './pages/hot-offers/hot-offers';
import { Qna } from './pages/qna/qna';

import { QuickView } from './pages/quickview/quickview';
import { ForgotPassword } from './auth/forgot-password/forgot-password';
import { Login } from './auth/login/login';
import { Signup } from './auth/signup/signup';
import { ResetPassword } from './auth/reset-password/reset-password';
import { MiniCart } from './pages/mini-cart/mini-cart';
import { Search } from './pages/search/search';

import { Shipping } from './layout/policy/shipping/shipping';
import { Return } from './layout/policy/return/return';
import { Privacy } from './layout/policy/privacy/privacy';
import { Terms } from './layout/policy/terms/terms';
import { CountdownTimer } from './components/countdown-timer/countdown-timer';
import { LiveChat } from './components/live-chat/live-chat';
import { Buynowcheckout } from './pages/buynowcheckout/buynowcheckout';
import { UserProfile } from './pages/user-profile/user-profile';
import { AdminDashboard } from './pages/admin-dashboard/admin-dashboard';
import { AdminProfile } from './pages/admin-profile/admin-profile';
import { AdminProducts } from './pages/admin-products/admin-products';
import { AdminOrders } from './pages/admin-orders/admin-orders';
import { SavedVouchers } from './pages/saved-vouchers/saved-vouchers';
import { AdminBlog } from './pages/admin-blog/admin-blog';
import { AdminProductFix } from './pages/admin-product-fix/admin-product-fix';
import { Adminprofilefix } from './pages/adminprofilefix/adminprofilefix';
import { Adminordercheck } from './pages/adminordercheck/adminordercheck';
import { Adminblogfix } from './pages/adminblogfix/adminblogfix';


@NgModule({
  declarations: [
    App,
    Header,
    Footer,
    Home,
    ProductComponent,
    ProductDetail,
    Cart,
    OrderConfirm,
    OrderHistory,
    Wishlist,
    About,
    Blog,
    HotOffers,
    Qna,
    ForgotPassword,
    Login,
    Signup,
    ResetPassword,
    Shipping,
    Return,
    Privacy,
    Terms,
    CountdownTimer,
    LiveChat,
    Buynowcheckout,
    UserProfile,
    AdminDashboard,
    AdminProfile,
    AdminProducts,
    AdminOrders,
    SavedVouchers,
    AdminBlog,
    AdminProductFix,
    Adminprofilefix,
    Adminordercheck,
    Adminblogfix,
    
  ],
  imports: [
    BrowserModule,
    CommonModule,
    RouterModule,       // <-- ĐÃ CÓ RỒI, giữ lại để routerLink hoạt động
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule,
    CurrencyPipe,
    LowerCasePipe,
    QuickView,
    MiniCart,
    Search,
    BlogDetail,         // <-- CHỈ BlogDetail mới thêm vào imports (vì là standalone)
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
  ],
  bootstrap: [App]
})
export class AppModule { }