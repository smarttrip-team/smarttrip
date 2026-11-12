import 'package:flutter_test/flutter_test.dart';
import 'package:smarttrip_mobile/core/providers/auth_provider.dart';
import 'package:smarttrip_mobile/main.dart';

void main() {
  testWidgets('SmartTripApp smoke test', (WidgetTester tester) async {
    final auth = AuthProvider();
    await tester.pumpWidget(SmartTripApp(authProvider: auth));
    expect(find.byType(SmartTripApp), findsOneWidget);
  });
}
