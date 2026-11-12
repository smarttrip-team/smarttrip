import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/storage/session_storage.dart';
import '../../core/providers/wallet_provider.dart';
import '../../shared/models/models.dart';

class WalletScreen extends StatefulWidget {
  const WalletScreen({super.key});

  @override
  State<WalletScreen> createState() => _WalletScreenState();
}

class _WalletScreenState extends State<WalletScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final userId = SessionStorage.userId ?? 10;
      context.read<WalletProvider>().fetchWalletAndTransactions(userId);
    });
  }

  Future<void> _showTopUpDialog() async {
    final amounts = [1000000, 2000000, 5000000, 10000000];
    int selectedAmount = amounts[1];
    final customController = TextEditingController();
    bool isCustom = false;
    bool isSubmitting = false;

    await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Padding(
              padding: EdgeInsets.only(
                left: 20,
                right: 20,
                top: 20,
                bottom: MediaQuery.of(context).viewInsets.bottom + 20,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Nạp tiền vào ví SmartTrip',
                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close),
                        onPressed: () => Navigator.pop(ctx),
                      ),
                    ],
                  ),
                  const Text('Chọn nhanh mệnh giá:'),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 10,
                    runSpacing: 10,
                    children: amounts.map((amt) {
                      final isSelected = !isCustom && selectedAmount == amt;
                      return ChoiceChip(
                        selected: isSelected,
                        label: Text(formatVND(amt)),
                        onSelected: (val) {
                          setModalState(() {
                            isCustom = false;
                            selectedAmount = amt;
                          });
                        },
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: customController,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(
                      labelText: 'Hoặc nhập số tiền tùy ý (VNĐ)',
                      prefixIcon: Icon(Icons.edit_note),
                    ),
                    onChanged: (val) {
                      setModalState(() {
                        isCustom = val.trim().isNotEmpty;
                      });
                    },
                  ),
                  const SizedBox(height: 20),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: isSubmitting
                          ? null
                          : () async {
                              final finalAmount = isCustom
                                  ? (double.tryParse(customController.text.trim()) ?? 0.0)
                                  : selectedAmount.toDouble();

                              if (finalAmount <= 0) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(content: Text('Vui lòng chọn hoặc nhập số tiền hợp lệ.')),
                                );
                                return;
                              }

                              setModalState(() => isSubmitting = true);

                              final messenger = ScaffoldMessenger.of(context);
                              final nav = Navigator.of(ctx);
                              final userId = SessionStorage.userId ?? 10;
                              final walletProv = context.read<WalletProvider>();

                              final ok = await walletProv.topUp(userId: userId, amount: finalAmount);
                              setModalState(() => isSubmitting = false);

                              if (ok) {
                                nav.pop();
                                messenger.showSnackBar(
                                  SnackBar(
                                    content: Text('Nạp thành công ${formatVND(finalAmount)} vào ví!'),
                                    backgroundColor: Colors.green,
                                  ),
                                );
                              } else {
                                messenger.showSnackBar(
                                  SnackBar(
                                    content: Text(walletProv.errorMessage ?? 'Nạp tiền thất bại'),
                                    backgroundColor: Colors.red,
                                  ),
                                );
                              }
                            },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.indigo,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      child: isSubmitting
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                            )
                          : const Text('Xác nhận Nạp tiền'),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  Color _getTxColor(String type) {
    switch (type.toUpperCase()) {
      case 'TOP_UP':
      case 'REFUND':
      case 'RELEASE':
        return Colors.green;
      case 'HOLD':
        return Colors.orange;
      case 'CAPTURE':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    final walletProv = context.watch<WalletProvider>();
    final available = walletProv.availableBalance;
    final wallet = walletProv.wallet;
    final transactions = walletProv.transactions;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Ví điện tử SmartTrip Pay'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              final userId = SessionStorage.userId ?? 10;
              context.read<WalletProvider>().fetchWalletAndTransactions(userId);
            },
          ),
        ],
      ),
      body: walletProv.isLoading && wallet == null
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: () async {
                final userId = SessionStorage.userId ?? 10;
                await context.read<WalletProvider>().fetchWalletAndTransactions(userId);
              },
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (walletProv.errorMessage != null)
                      Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.red.shade50,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(walletProv.errorMessage!, style: const TextStyle(color: Colors.red)),
                      ),

                    // Balance Gradient Card
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [Color(0xFF3F51B5), Color(0xFF1A237E)],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: const [
                          BoxShadow(
                            color: Colors.black26,
                            blurRadius: 12,
                            offset: Offset(0, 6),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text(
                                'Số dư khả dụng',
                                style: TextStyle(color: Colors.white70, fontSize: 14),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(
                                  color: Colors.white24,
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Text(
                                  wallet?.status ?? 'ACTIVE',
                                  style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text(
                            formatVND(available),
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 28,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 16),
                          const Divider(color: Colors.white24),
                          const SizedBox(height: 8),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text('Đang tạm giữ (Hold)', style: TextStyle(color: Colors.white60, fontSize: 12)),
                                  Text(
                                    formatVND(walletProv.heldAmount),
                                    style: const TextStyle(color: Colors.orangeAccent, fontWeight: FontWeight.bold),
                                  ),
                                ],
                              ),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.end,
                                children: [
                                  const Text('Tổng số dư tài khoản', style: TextStyle(color: Colors.white60, fontSize: 12)),
                                  Text(
                                    formatVND(walletProv.balance),
                                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Quick Top-up Button
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        onPressed: _showTopUpDialog,
                        icon: const Icon(Icons.add_card),
                        label: const Text('Nạp tiền vào ví'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.indigo,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Ledger Transactions Section
                    Text(
                      'Lịch sử giao dịch sổ cái (Double-Entry Ledger)',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 8),

                    if (transactions.isEmpty)
                      Container(
                        padding: const EdgeInsets.all(24),
                        alignment: Alignment.center,
                        child: Column(
                          children: [
                            Icon(Icons.receipt_long_outlined, size: 48, color: Colors.grey.shade400),
                            const SizedBox(height: 8),
                            Text('Chưa có giao dịch nào trong sổ cái.', style: TextStyle(color: Colors.grey.shade600)),
                          ],
                        ),
                      )
                    else
                      ListView.separated(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: transactions.length,
                        separatorBuilder: (context, index) => const Divider(height: 1),
                        itemBuilder: (context, index) {
                          final tx = transactions[index];
                          final isPositive = tx.type == 'TOP_UP' || tx.type == 'REFUND' || tx.type == 'RELEASE';
                          final color = _getTxColor(tx.type);

                          return ListTile(
                            contentPadding: const EdgeInsets.symmetric(vertical: 4, horizontal: 8),
                            leading: CircleAvatar(
                              backgroundColor: color.withAlpha(25),
                              child: Icon(
                                isPositive ? Icons.arrow_downward : Icons.arrow_upward,
                                color: color,
                                size: 18,
                              ),
                            ),
                            title: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  tx.type,
                                  style: TextStyle(fontWeight: FontWeight.bold, color: color),
                                ),
                                Text(
                                  '${isPositive ? '+' : '-'}${formatVND(tx.amount)}',
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    color: color,
                                    fontSize: 15,
                                  ),
                                ),
                              ],
                            ),
                            subtitle: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                if (tx.description != null && tx.description!.isNotEmpty)
                                  Text(tx.description!, style: const TextStyle(fontSize: 12)),
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      'Số dư sau: ${formatVND(tx.balanceAfter)}',
                                      style: TextStyle(fontSize: 11, color: Colors.grey.shade600),
                                    ),
                                    if (tx.createdAt != null)
                                      Text(
                                        tx.createdAt!.split('T')[0],
                                        style: TextStyle(fontSize: 11, color: Colors.grey.shade500),
                                      ),
                                  ],
                                ),
                              ],
                            ),
                          );
                        },
                      ),
                  ],
                ),
              ),
            ),
    );
  }
}
