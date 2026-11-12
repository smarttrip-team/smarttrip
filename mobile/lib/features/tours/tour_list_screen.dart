import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../core/providers/tour_provider.dart';
import '../../shared/models/models.dart';
import '../../app/theme/app_theme.dart';

class TourListScreen extends StatefulWidget {
  const TourListScreen({super.key});

  @override
  State<TourListScreen> createState() => _TourListScreenState();
}

class _TourListScreenState extends State<TourListScreen> {
  final _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<TourProvider>().fetchTours();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final tourProv = context.watch<TourProvider>();
    final filteredTours = tourProv.filteredTours;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Khám phá Tour du lịch'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            onPressed: () => context.read<TourProvider>().fetchTours(),
          ),
        ],
      ),
      body: Column(
        children: [
          // Live Search Bar
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              controller: _searchController,
              onChanged: (val) => context.read<TourProvider>().setSearchQuery(val),
              decoration: InputDecoration(
                hintText: 'Tìm tour, điểm đến Hạ Long, Đà Nẵng...',
                prefixIcon: const Icon(Icons.search_rounded),
                suffixIcon: tourProv.searchQuery.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear_rounded),
                        onPressed: () {
                          _searchController.clear();
                          context.read<TourProvider>().setSearchQuery('');
                        },
                      )
                    : null,
              ),
            ),
          ),

          // Content Area
          Expanded(
            child: tourProv.isLoading
                ? const Center(child: CircularProgressIndicator())
                : tourProv.errorMessage != null
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.cloud_off_rounded, size: 48, color: Colors.grey),
                            const SizedBox(height: 12),
                            Text(tourProv.errorMessage!, style: const TextStyle(color: Colors.red)),
                            const SizedBox(height: 12),
                            ElevatedButton(
                              onPressed: () => context.read<TourProvider>().fetchTours(),
                              child: const Text('Thử lại'),
                            ),
                          ],
                        ),
                      )
                    : filteredTours.isEmpty
                        ? Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                const Icon(Icons.travel_explore_rounded, size: 56, color: Colors.grey),
                                const SizedBox(height: 12),
                                Text(
                                  tourProv.searchQuery.isEmpty
                                      ? 'Không tìm thấy tour du lịch nào.'
                                      : 'Không có kết quả khớp với "${tourProv.searchQuery}"',
                                  style: const TextStyle(color: Colors.grey),
                                ),
                              ],
                            ),
                          )
                        : RefreshIndicator(
                            onRefresh: () => context.read<TourProvider>().fetchTours(),
                            child: ListView.separated(
                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                              itemCount: filteredTours.length,
                              separatorBuilder: (context, index) => const SizedBox(height: 16),
                              itemBuilder: (context, index) {
                                return _buildTourCard(context, filteredTours[index]);
                              },
                            ),
                          ),
          ),
        ],
      ),
    );
  }

  Widget _buildTourCard(BuildContext context, Tour tour) {
    return Card(
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: () {
          context.push('/tours/detail', extra: tour);
        },
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Tour Image
            Stack(
              children: [
                Container(
                  height: 160,
                  width: double.infinity,
                  color: Colors.grey.shade200,
                  child: tour.coverImageUrl != null && tour.coverImageUrl!.isNotEmpty
                      ? Image.network(
                          tour.coverImageUrl!,
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) => const Center(
                            child: Icon(Icons.image_not_supported_rounded, size: 40, color: Colors.grey),
                          ),
                        )
                      : const Center(
                          child: Icon(Icons.landscape_rounded, size: 48, color: Colors.grey),
                        ),
                ),
                Positioned(
                  top: 12,
                  right: 12,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.black54,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.schedule_rounded, color: Colors.white, size: 14),
                        const SizedBox(width: 4),
                        Text(
                          '${tour.durationDays}N${tour.durationDays - 1 > 0 ? tour.durationDays - 1 : 1}Đ',
                          style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),

            // Tour Info
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    tour.title,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    tour.description,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 12,
                      color: AppTheme.textSecondary,
                    ),
                  ),
                  const SizedBox(height: 12),

                  // Price & CTA
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Giá từ', style: TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
                          Text(
                            formatVND(tour.basePrice),
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: AppTheme.primaryColor,
                            ),
                          ),
                        ],
                      ),
                      ElevatedButton(
                        onPressed: () {
                          context.push('/tours/detail', extra: tour);
                        },
                        style: ElevatedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                        ),
                        child: const Text('Xem chi tiết'),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
