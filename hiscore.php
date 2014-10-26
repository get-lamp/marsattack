<?php
	$query = $_POST['query'];
	
	define(RANKING_FILE, "./ranking.txt");
	
	switch($query){
		case("hiscore"):	
			echo getHiScore();
			break;
		case("ranking"):
			if(!($ranking = getRanking())){return;}			
			echo"<table><thead><td colspan='4'>TOP SCORES</td></tr><tr><td>rank</td><td>waves</td><td>score</td><td>player</td></thead>";
			foreach($ranking as $rank => $data){
				$rank += 1;
				echo"<tr><td>{$rank}</td><td>{$data["waves"]}</td><td>{$data["score"]}</td><td>{$data["player"]}</td></tr>";	
			}
			echo"</table>";
			break;
		case("addscore"):
			addScore($_POST["score"], $_POST["waves"], $_POST["player"]);
			break;
		case("youranked"):
			getRank($_POST["score"]);
			break;
		default:
			break;
	}
	
	function getRank($score){
		if($ranking = getRanking()){
			$answer = null;
			foreach($ranking as $rank => $data){
				if($score > (int)$data["score"]){
					$answer = $rank; 
					echo $answer;
					return;
				}				
			}
			echo $rank + 1;
			return;
		} 
		else {echo 1; return;}		
	}
		
	function getHiScore(){
		if($hiscore = getRanking(1)){
			return "HI-SCORE: ".$hiscore["score"];
		}
	}
	
	function getRanking($search = false){	
		if($handle = @fopen(RANKING_FILE, "r")){
			while( $raw_ranking = fscanf($handle, "%s\t%s\t%s\t%s\n") ){
				list ( $rank, $score, $waves, $player ) = $raw_ranking;
				
				$data = array("score" => $score, "waves" => $waves, "player" => $player);
				
				if($search){ 
					if($rank == ($search-1)){ return $data; } else { continue; } 
				}	
				
				$ranking[$rank] = $data;
				ksort($ranking);
			}
			if(count($ranking) == 0)
				return false;
			
			fclose($handle);
			return $ranking;
		}		
		return false;
	}
	
	function addScore($score, $waves, $player){
		$newScore = array("score" => $score, "waves" => $waves, "player" => $player);
		if($record = getRanking()){

			array_push($record, $newScore);
		
			foreach($record as $rank => $data){				
				$s[$rank] = $data["score"];
				$w[$rank] = $data["waves"];			
			}
			array_multisort($s, SORT_DESC, $w, SORT_ASC, $record);			
		} else{
			$record = array($newScore);
		}
		$handle = fopen(RANKING_FILE, "w+");
		foreach($record as $rank => $data){
			fwrite($handle, "{$rank} {$data['score']} {$data['waves']} {$data['player']}\n");
		}		
		fclose($handle);
	}
?>