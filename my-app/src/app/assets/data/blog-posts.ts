// src/app/data/blog-posts.ts

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  description: string;
  headerImage: string;
  featuredImage: string;
  tag: string;
  contentHtml: string;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'chat-lieu-thien-nhien-va-da-nhay-cam',
    title: 'Chất liệu thiên nhiên & làn da nhạy cảm',
    date: '24 tháng 10, 2025',
    description: 'Vì sao cotton hữu cơ và linen là lựa chọn an toàn cho da nhạy cảm?',
    headerImage: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=1200&auto=format&fit=crop',
featuredImage: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800&auto=format&fit=crop',
    tag: 'Sống xanh',
    contentHtml: `
      <img src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200&auto=format&fit=crop" alt="Vải linen tự nhiên" class="w-full rounded-xl my-8 shadow-md">
      <p class="leading-relaxed mb-6">Da nhạy cảm dễ kích ứng với hóa chất và chất liệu nhân tạo. Cotton hữu cơ và linen chính là giải pháp hoàn hảo từ thiên nhiên.</p>

      <h2 class="text-2xl font-bold text-green-700 mt-12 mb-4">1. Không chứa hóa chất độc hại</h2>
      <p class="leading-relaxed mb-6">Cotton hữu cơ được trồng không sử dụng thuốc trừ sâu, phân bón hóa học hay GMO — an toàn tuyệt đối cho làn da mỏng manh nhất.</p>

      <h2 class="text-2xl font-bold text-green-700 mt-12 mb-4">2. Thoáng khí vượt trội</h2>
      <img src="https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=1200&auto=format&fit=crop" alt="Linen thoáng mát" class="w-full rounded-xl my-8 shadow-md">
      <p class="leading-relaxed mb-6">Linen thấm hút mồ hôi gấp 5 lần cotton thường, giúp da luôn khô ráo, giảm nguy cơ viêm nhiễm.</p>

      <h2 class="text-2xl font-bold text-green-700 mt-12 mb-4">3. Kháng khuẩn tự nhiên</h2>
      <p class="leading-relaxed mb-6">Cả linen và cotton hữu cơ đều có khả năng kháng khuẩn nhẹ, rất tốt cho da mụn hoặc eczema.</p>

      <blockquote class="my-12 py-8 px-10 border-l-8 border-green-600 bg-green-50 rounded-r-xl italic text-lg text-green-800">
        "Một chiếc áo linen không chỉ dịu nhẹ với làn da, mà còn dịu nhẹ với Trái Đất."
        <span class="block mt-4 text-right font-bold text-green-700">– ROOFI Journal</span>
      </blockquote>

      <p class="text-lg leading-relaxed text-center font-medium">
        Hãy để làn da bạn được yêu thương bằng những chất liệu thuần khiết nhất từ thiên nhiên.
      </p>
    `
  },

  {
    slug: '5-thoi-quen-xanh-song-toi-gian',
    title: '5 thói quen xanh giúp bạn sống tối giản và bền vững hơn',
    date: '31 tháng 08, 2025',
    description: 'Những thay đổi nhỏ trong sinh hoạt hàng ngày có thể tạo nên khác biệt lớn cho môi trường.',
    headerImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&auto=format&fit=crop',
    featuredImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop',
    tag: 'Sống xanh',
    contentHtml: `
      <img src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&auto=format&fit=crop" alt="Buổi sáng xanh" class="w-full rounded-xl my-8 shadow-md">
      <p class="leading-relaxed mb-6">Sống tối giản không có nghĩa là thiếu thốn — mà là trân trọng những gì thật sự quan trọng. ROOFI gợi ý 5 thói quen nhỏ giúp bạn sống xanh hơn mỗi ngày.</p>

      <h2 class="text-2xl font-bold text-green-700 mt-12 mb-4">1. Bắt đầu ngày mới với năng lượng tự nhiên</h2>
      <p class="leading-relaxed mb-6">Thay cà phê takeaway bằng trà thảo mộc tự pha và mở cửa đón ánh nắng — vừa khỏe vừa giảm rác nhựa.</p>

      <h2 class="text-2xl font-bold text-green-700 mt-12 mb-4">2. Ưu tiên trang phục thân thiện môi trường</h2>
      <img src="https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=1200&auto=format&fit=crop" alt="Trang phục linen" class="w-full rounded-xl my-8 shadow-md">
      <p class="leading-relaxed mb-6">Chọn quần áo từ linen, cotton hữu cơ — thoáng mát và phân hủy sinh học.</p>

      <h2 class="text-2xl font-bold text-green-700 mt-12 mb-4">3. Nói không với nhựa dùng một lần</h2>
      <p class="leading-relaxed mb-6">Mang theo bình nước, túi vải, ống hút tre — hành động nhỏ, tác động lớn.</p>

      <h2 class="text-2xl font-bold text-green-700 mt-12 mb-4">4. Tạo góc sống Eco Zen</h2>
      <img src="https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&auto=format&fit=crop" alt="Góc sống xanh" class="w-full rounded-xl my-8 shadow-md">
      <p class="leading-relaxed mb-6">Chỉ cần vài cây xanh và ánh sáng tự nhiên là đủ để tâm hồn thư thái.</p>

      <h2 class="text-2xl font-bold text-green-700 mt-12 mb-4">5. Mua ít — chọn kỹ</h2>
      <p class="leading-relaxed mb-6">Trước khi mua, tự hỏi: "Mình có thật sự cần món này không?"</p>

      <blockquote class="my-12 py-8 px-10 border-l-8 border-green-600 bg-green-50 rounded-r-xl italic text-lg text-green-800">
        "Sống xanh không phải là xu hướng — mà là cách sống tử tế với chính mình và hành tinh."
        <span class="block mt-4 text-right font-bold text-green-700">– ROOFI Journal</span>
      </blockquote>
    `
  },

  {
    slug: 'phoi-do-linen-mua-he',
    title: 'Cách phối đồ linen mát mẻ cho mùa hè oi bức',
    date: '15 tháng 07, 2025',
    description: 'Gợi ý 7 set đồ linen thoải mái, thanh lịch cho ngày hè năng động.',
    headerImage: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&auto=format&fit=crop',
    featuredImage: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop',
    tag: 'Thời trang',
    contentHtml: `
      <img src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&auto=format&fit=crop" alt="Đầm linen mùa hè" class="w-full rounded-xl my-8 shadow-md">
      <p class="leading-relaxed mb-6">Linen không chỉ mát mà còn cực kỳ thanh lịch. Dưới đây là những cách phối đồ giúp bạn luôn thoải mái trong cái nóng mùa hè.</p>

      <h2 class="text-2xl font-bold text-green-700 mt-12 mb-4">1. Áo linen oversize + quần short trắng</h2>
      <p class="leading-relaxed mb-6">Set đồ kinh điển: thoải mái, mát mẻ và vô cùng sang trọng.</p>

      <h2 class="text-2xl font-bold text-green-700 mt-12 mb-4">2. Đầm linen midi + sandal da</h2>
      <img src="https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=1200&auto=format&fit=crop" alt="Đầm linen midi" class="w-full rounded-xl my-8 shadow-md">
      <p class="leading-relaxed mb-6">Phong cách nghỉ dưỡng hoàn hảo cho ngày hè.</p>

      <h2 class="text-2xl font-bold text-green-700 mt-12 mb-4">3. Layer linen với áo ba lỗ cotton</h2>
      <p class="leading-relaxed mb-6">Tạo điểm nhấn tinh tế mà vẫn cực kỳ thoáng mát.</p>

      <p class="text-lg leading-relaxed text-center font-medium mt-12">
        Linen không chỉ là chất liệu — mà là phong cách sống chậm, gần gũi thiên nhiên.
      </p>
    `
  },

  {
    slug: 'bao-quan-do-linen',
    title: 'Hướng dẫn bảo quản và giặt đồ linen đúng cách',
    date: '20 tháng 06, 2025',
    description: 'Mẹo giữ form dáng và màu sắc bền đẹp cho trang phục linen yêu thích.',
    headerImage: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=1200&auto=format&fit=crop',
    featuredImage: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=800&auto=format&fit=crop',
    tag: 'Chăm sóc',
    contentHtml: `
      <img src="https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=1200&auto=format&fit=crop" alt="Giặt đồ linen" class="w-full rounded-xl my-8 shadow-md">
      <p class="leading-relaxed mb-6">Linen càng mặc càng mềm đẹp — nếu bạn biết cách chăm sóc đúng.</p>

      <h2 class="text-2xl font-bold text-green-700 mt-12 mb-4">Cách giặt</h2>
      <p class="leading-relaxed mb-6">• Giặt ở nhiệt độ dưới 40°C<br>• Dùng nước giặt nhẹ dành cho đồ mỏng<br>• Không dùng thuốc tẩy mạnh</p>

      <h2 class="text-2xl font-bold text-green-700 mt-12 mb-4">Phơi & ủi</h2>
      <img src="https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?w=1200&auto=format&fit=crop" alt="Phơi đồ linen" class="w-full rounded-xl my-8 shadow-md">
      <p class="leading-relaxed mb-6">• Phơi nơi thoáng mát, tránh nắng gắt<br>• Ủi khi còn hơi ẩm để dễ dàng<br>• Ủi mặt trái để giữ màu</p>

      <p class="text-lg leading-relaxed text-center font-medium mt-12">
        Chăm sóc linen đúng cách là cách bạn trân trọng từng sản phẩm mình sở hữu.
      </p>
    `
  },

  {
    slug: 'cotton-huu-co-la-gi',
    title: 'Cotton hữu cơ là gì? Tại sao ROOFI chọn chất liệu này?',
    date: '10 tháng 05, 2025',
    description: 'Hành trình từ cánh đồng đến tủ đồ – câu chuyện về sự bền vững thực sự.',
    headerImage: 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=1200&auto=format&fit=crop',
    featuredImage: 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=800&auto=format&fit=crop',
    tag: 'Chất liệu',
    contentHtml: `
      <img src="https://images.unsplash.com/photo-1615671524827-c1fe3973b648?w=1200&auto=format&fit=crop" alt="Cánh đồng cotton hữu cơ" class="w-full rounded-xl my-8 shadow-md">
      <p class="leading-relaxed mb-6">Cotton hữu cơ không chỉ là một loại vải — mà là cam kết với môi trường và sức khỏe.</p>

      <h2 class="text-2xl font-bold text-green-700 mt-12 mb-4">Sự khác biệt</h2>
      <p class="leading-relaxed mb-6">Không thuốc trừ sâu, không GMO, không phân bón hóa học — bảo vệ đất, nước và nông dân.</p>

      <h2 class="text-2xl font-bold text-green-700 mt-12 mb-4">Tốt cho người mặc</h2>
      <img src="https://images.unsplash.com/photo-1624206112918-f140f087f9b5?w=1200&auto=format&fit=crop" alt="Áo cotton hữu cơ" class="w-full rounded-xl my-8 shadow-md">
      <p class="leading-relaxed mb-6">Không dư lượng hóa chất → an toàn cho da nhạy cảm, trẻ em và mọi lứa tuổi.</p>

      <p class="text-lg leading-relaxed text-center font-medium mt-12">
        Đó là lý do ROOFI chỉ dùng cotton hữu cơ — vì thời trang đẹp nhất là thời trang tử tế.
      </p>
    `
  },

  {
    slug: 'thoi-trang-ben-vung',
    title: 'Thời trang bền vững không phải xu hướng – mà là tương lai',
    date: '05 tháng 04, 2025',
    description: 'ROOFI và cam kết giảm thiểu tác động đến môi trường trong từng sản phẩm.',
    headerImage: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1200&auto=format&fit=crop',
    featuredImage: 'https://images.unsplash.com/photo-1558769132-cb1aea1f1a9a?w=800&auto=format&fit=crop',
    tag: 'Thời trang',
    contentHtml: `
      <img src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&auto=format&fit=crop" alt="Thời trang bền vững" class="w-full rounded-xl my-8 shadow-md">
      <p class="leading-relaxed mb-6">Ngành thời trang là một trong những ngành gây ô nhiễm lớn thứ hai thế giới. Nhưng chúng ta có thể thay đổi — từng sản phẩm một.</p>

      <h2 class="text-2xl font-bold text-green-700 mt-12 mb-4">ROOFI chọn con đường khác</h2>
      <p class="leading-relaxed mb-6">• Chất liệu tự nhiên, hữu cơ<br>• Sản xuất giới hạn<br>• Thiết kế vượt thời gian<br>• Bao bì tái chế 100%</p>

      <h2 class="text-2xl font-bold text-green-700 mt-12 mb-4">Thời trang bền vững là gì?</h2>
      <p class="leading-relaxed mb-6">Không phải mặc đồ cũ mãi — mà là chọn những món đồ chất lượng cao, bền đẹp, ít tác động môi trường và có thể mặc nhiều năm.</p>

      <blockquote class="my-12 py-8 px-10 border-l-8 border-green-600 bg-green-50 rounded-r-xl italic text-lg text-green-800">
        "Chúng tôi không chạy theo xu hướng nhanh — chúng tôi tạo ra những sản phẩm trường tồn."
        <span class="block mt-4 text-right font-bold text-green-700">– ROOFI</span>
      </blockquote>
    `
  }
];