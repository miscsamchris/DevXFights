import { motion } from 'framer-motion';
import Image from 'next/image';

interface BattleCardProps {
  nft: any;
  username: string;
  onChallenge: () => void;
}

export function BattleCard({ nft, username, onChallenge }: BattleCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 hover:border-gray-700/50 transition-all"
    >
      <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-4">
        <Image
          src={nft.metadata.image}
          alt={nft.current_token_data.token_name}
          width={500}
          height={500}
          className="transition-transform hover:scale-105"
        />
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onChallenge}
        className="w-full bg-white text-black px-6 py-3 rounded-full font-medium transition-all hover:shadow-lg hover:shadow-white/20"
      >
        Challenge to Battle
      </motion.button>
    </motion.div>
  );
} 