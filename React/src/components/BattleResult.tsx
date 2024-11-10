import { motion } from 'framer-motion';
import Image from 'next/image';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';

interface BattleResultProps {
  battleResult: {
    winner: string;
    battleResult: string;
    challenger: string;
    defender: string;
    challengerAvatar?: string;
    defenderAvatar?: string;
  };
  onClose: () => void;
}

export function BattleResult({ battleResult, onClose }: BattleResultProps) {
  const [winner, story] = battleResult.battleResult.split('Battle Story:');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="bg-[#1E293B] rounded-xl p-6 max-w-2xl w-full relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          ✕
        </button>

        {/* Battle Result Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-6">Battle Results</h2>
          
          {/* Avatars and VS Section */}
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <Avatar className="w-20 h-20 mx-auto mb-2 border-2 border-purple-500">
                <AvatarImage src={battleResult.challengerAvatar || '/default-avatar.png'} />
                <AvatarFallback>{battleResult.challenger[0]}</AvatarFallback>
              </Avatar>
              <span className="text-purple-400">{battleResult.challenger}</span>
            </div>

            <div className="flex flex-col items-center justify-center">
              <div className="text-2xl font-bold text-gray-400 my-2">VS</div>
              <div className="w-12 h-0.5 bg-gray-600"></div>
            </div>

            <div className="text-center">
              <Avatar className="w-20 h-20 mx-auto mb-2 border-2 border-purple-500">
                <AvatarImage src={battleResult.defenderAvatar || '/default-avatar.png'} />
                <AvatarFallback>{battleResult.defender[0]}</AvatarFallback>
              </Avatar>
              <span className="text-purple-400">{battleResult.defender}</span>
            </div>
          </div>
        </div>

        {/* Winner Announcement */}
        <div className="bg-purple-500/20 rounded-lg p-4 mb-6">
          <h3 className="text-xl font-semibold text-white text-center">
            {winner}
          </h3>
        </div>

        {/* Battle Story */}
        <div className="bg-[#0F172A] rounded-lg p-4">
          <p className="text-gray-300 leading-relaxed whitespace-pre-line">
            {story}
          </p>
        </div>

        {/* Action Button */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={onClose}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
} 