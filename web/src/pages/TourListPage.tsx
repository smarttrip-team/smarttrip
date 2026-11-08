import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { TourFilter } from '../components/tours/TourFilter';
import { TourCard } from '../components/tours/TourCard';
import { Pagination } from '../components/tours/Pagination';
import { tourApi } from '../api/tourApi';
import type { TourSearchParams } from '../types/tour';
import { Loader2, SearchX } from 'lucide-react';

export const TourListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Extract params from URL
  const currentParams: TourSearchParams = useMemo(() => {
    return {
      keyword: searchParams.get('keyword') || undefined,
      city: searchParams.get('city') || undefined,
      destinationId: searchParams.get('destinationId') || undefined,
      minPrice: searchParams.get('minPrice') || undefined,
      maxPrice: searchParams.get('maxPrice') || undefined,
      page: searchParams.get('page') ? Number(searchParams.get('page')) : 0,
      size: 9,
      sortBy: (searchParams.get('sortBy') as any) || undefined,
    };
  }, [searchParams]);

  // Query tours via TanStack Query
  const { data, isLoading, isError } = useQuery({
    queryKey: ['tours', currentParams],
    queryFn: () => tourApi.searchTours(currentParams),
  });

  const handleFilterChange = (newParams: TourSearchParams) => {
    const updated = new URLSearchParams();

    if (newParams.keyword) updated.set('keyword', newParams.keyword);
    if (newParams.city) updated.set('city', newParams.city);
    if (newParams.destinationId) updated.set('destinationId', String(newParams.destinationId));
    if (newParams.minPrice) updated.set('minPrice', String(newParams.minPrice));
    if (newParams.maxPrice) updated.set('maxPrice', String(newParams.maxPrice));
    if (newParams.sortBy) updated.set('sortBy', newParams.sortBy);
    updated.set('page', '0'); // reset to page 0 on filter change

    setSearchParams(updated);
  };

  const handlePageChange = (newPage: number) => {
    const updated = new URLSearchParams(searchParams);
    updated.set('page', String(newPage));
    setSearchParams(updated);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const tours = data?.content || [];
  const totalElements = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const currentPage = currentParams.page ?? 0;

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Breadcrumb / Title */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Trang chủ</span>
            <span>/</span>
            <span className="text-primary-600 font-bold">Khám phá Tour</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Tất Cả Tour Du Lịch
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Tìm thấy <strong className="text-slate-900 font-bold">{totalElements}</strong> chương trình tour phù hợp với yêu cầu của bạn.
          </p>
        </div>

        {/* Content Layout: Sidebar Filter + Grid List */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Left Sidebar Filter */}
          <div className="lg:col-span-1 sticky top-24">
            <TourFilter
              key={JSON.stringify(currentParams)}
              initialParams={currentParams}
              onFilterChange={handleFilterChange}
              onReset={handleResetFilters}
            />
          </div>

          {/* Right Tours List */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="py-28 text-center bg-white rounded-2xl border border-slate-100 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
                <span className="text-slate-500 text-sm font-semibold">Đang tìm kiếm các tour du lịch tốt nhất...</span>
              </div>
            ) : isError ? (
              <div className="py-20 text-center bg-white rounded-2xl border border-rose-100 p-8">
                <p className="text-rose-600 font-bold text-base">Đã xảy ra lỗi khi tải danh sách tour.</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-bold shadow-md"
                >
                  Thử lại
                </button>
              </div>
            ) : tours.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
                <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
                  <SearchX className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Không tìm thấy tour phù hợp</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Hãy thử thay đổi từ khóa, điều chỉnh khoảng giá hoặc bỏ chọn một số bộ lọc để tìm thêm tour khác nhé.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="mt-6 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-md transition-all"
                >
                  Xóa toàn bộ bộ lọc
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {tours.map((tour) => (
                    <TourCard key={tour.id} tour={tour} />
                  ))}
                </div>

                {/* Pagination */}
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
