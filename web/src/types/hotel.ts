export interface RoomTypeAvailability {
  roomTypeId: number;
  roomName: string;
  pricePerNight: number;
  availableRooms: number;
  maxOccupancy?: number;
}

export interface HotelPackage {
  hotelId: number;
  hotelName: string;
  city: string;
  address?: string;
  starRating?: number;
  roomTypes: RoomTypeAvailability[];
}
